import { TextlintMessage, TextlintResult } from "@textlint/kernel";
import * as path from "path";
import { TextLintEngine } from "textlint";
import { TextDocument } from "vscode-languageserver-textdocument";
import {
  createConnection,
  Diagnostic,
  DiagnosticSeverity,
  DidChangeConfigurationNotification,
  InitializeParams,
  Position,
  ProposedFeatures,
  Range,
  TextDocuments,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";
import { URI } from "vscode-uri";
import { rules } from "./rules/rule";

// サーバーへの接続を作成(すべての提案された機能も含む)
const connection = createConnection(ProposedFeatures.all);

// テキストドキュメントを管理するクラスを作成します。
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;
  hasConfigurationCapability =
    (capabilities.workspace && !!capabilities.workspace.configuration) ?? false;

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
    },
  };
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined,
    );
  }
});

function getDefaultTextlintSettings() {
  const mySettings: { [key: string]: boolean } = {};

  rules.forEach((value) => {
    mySettings[value.ruleName] = value.enabled;
  });

  return mySettings;
}

const defaultSettings: ITextlintSettings = {
  maxNumberOfProblems: 1000,
  textlint: getDefaultTextlintSettings(),
};
let globalSettings: ITextlintSettings = defaultSettings;
const documentSettings: Map<string, Thenable<ITextlintSettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = (change.settings["japanese-proofreading"] ||
      defaultSettings) as ITextlintSettings;
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

/**
 * VSCode側の設定を取得します。
 */
function getDocumentSettings(resource: string): Thenable<ITextlintSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: "japanese-proofreading",
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose((close) => {
  documentSettings.delete(close.document.uri);
  resetTextDocument(close.document);
});

// ドキュメントを初めて開いた時と内容に変更があった際に実行します。
documents.onDidChangeContent(async (change) => {
  validateTextDocument(change.document);
});


const engine: TextLintEngine = new TextLintEngine({
  // textlint-rule-preset-icsmediaをそのまま使用せず、ymlファイルだけ参照している
  configFile: path.resolve(__dirname, "../.textlintrc"),
});

// バリデーション（textlint）を実施
async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // VSCode側の設定を取得
  const settings = await getDocumentSettings(textDocument.uri);

  const document = textDocument.getText();
  const ext: string = path.extname(URI.parse(textDocument.uri).fsPath);

  const results: TextlintResult[] = await engine.executeOnText(document, ext);
  const diagnostics: Diagnostic[] = [];

  // エラーが存在する場合
  if (engine.isErrorResults(results)) {
    // エラーメッセージ一覧を取得
    const messages: TextlintMessage[] = results[0].messages;
    const l: number = messages.length;
    for (let i: number = 0; i < l; i++) {
      const message: TextlintMessage = messages[i];
      const text: string = `${message.message}（${message.ruleId}）`;
      // 有効とされているエラーか？
      if (!isTarget(settings, message.ruleId, message.message)) {
        continue;
      }
      // エラーの文字数を取得します。
      // 文字数が存在しない場合の値は0になります。
      const posRange = message.fix?.range
        ? message.fix.range[1] - message.fix.range[0]
        : 0;
      // エラーの開始位置を取得します。
      const startPos: Position = Position.create(
        Math.max(0, message.line - 1),
        Math.max(0, message.column - 1),
      );
      // エラーの終了位置を取得します。
      const endPos: Position = Position.create(
        Math.max(0, message.line - 1),
        Math.max(0, message.column - 1 + posRange),
      );
      // 診断結果を作成
      const diagnostic: Diagnostic = {
        severity: toDiagnosticSeverity(message.severity),
        range: Range.create(startPos, endPos),
        message: text,
        source: "テキスト校正くん",
        code: message.ruleId,
      };
      diagnostics.push(diagnostic);
    }
  }
  // 診断結果をVSCodeに送信し、ユーザーインターフェースに表示します。
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

/**
 * 設定で有効としているエラーかどうか判定します。
 * @param settings VSCode側の設定
 * @param targetRuleId エラーのルールID
 * @param message エラーメッセージ
 * @returns
 */
function isTarget(
  settings: ITextlintSettings,
  targetRuleId: string,
  message: string,
): boolean {
  let bool: boolean = false;
  rules.forEach((rule) => {
    if (targetRuleId === "prh") {
      // prhのルールの場合

      // ruleIdからprh内の細かいルールを取得できないのでmessageに含まれているか取得している
      const ruleIdSub = rule.ruleId.split("/")[1];
      if (message.includes(`（${ruleIdSub}）`)) {
        // VSCodeの設定に存在しないルールは、デフォルト設定を使用します。
        bool = settings.textlint[rule.ruleName] ?? rule.enabled;
      }
    } else if (rule.ruleId.includes(targetRuleId)) {
      // 使用するルールのIDとエラーのルールIDが一致する場合

      // VSCodeの設定に存在しないルールは、デフォルト設定を使用します。
      // 例: ですます調、jtf-style/1.2.2
      bool = settings.textlint[rule.ruleName] ?? rule.enabled;
    }
  });
  return bool;
}

/**
 * validate済みの内容を破棄します。
 * @param textDocument
 */
async function resetTextDocument(textDocument: TextDocument): Promise<void> {
  const diagnostics: Diagnostic[] = [];
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

function toDiagnosticSeverity(severity: number) {
  switch (severity) {
    case 0:
      return DiagnosticSeverity.Information;
    case 1:
      return DiagnosticSeverity.Warning;
    case 2:
      return DiagnosticSeverity.Error;
  }
  return DiagnosticSeverity.Information;
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();

/**
 * VSCode側の設定
 */
interface ITextlintSettings {
  /** 問題を表示する最大数 */
  maxNumberOfProblems: number;
  /**
   * textlintの設定
   * trueとなっているルールを適用します。
   */
  textlint: { [key: string]: boolean };
}
