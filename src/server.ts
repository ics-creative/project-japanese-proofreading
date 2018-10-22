import { TextlintMessage, TextlintResult } from "@textlint/kernel";
import * as path from "path";
import { TextLintEngine } from "textlint";
import {
  createConnection,
  Diagnostic,
  DiagnosticSeverity,
  DidChangeConfigurationNotification,
  InitializeParams,
  Position,
  ProposedFeatures,
  Range,
  TextDocument,
  TextDocuments,
} from "vscode-languageserver";
import * as vscode_uri from "vscode-uri";

// サーバーへの接続を作成(すべての提案された機能も含む)
const connection = createConnection(ProposedFeatures.all);

// テキストドキュメントを管理するクラスを作成します。
const documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;
  hasConfigurationCapability =
    capabilities.workspace && !!capabilities.workspace.configuration;

  return {
    capabilities: {
      textDocumentSync: documents.syncKind,
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

const defaultSettings: ITextlintSettings = {
  maxNumberOfProblems: 1000,
  textlint: {
    rule01: true,
    rule02: true,
    rule03: true,
    rule04: true,
    rule05: true,
    rule06: true,
    rule07: true,
  },
};
let globalSettings: ITextlintSettings = defaultSettings;
const documentSettings: Map<string, Thenable<ITextlintSettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = (change.settings.japaneseProofreading ||
      defaultSettings) as ITextlintSettings;
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ITextlintSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: "japaneseProofreading",
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
documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

// バリデーション（textlint）を実施
async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // In this simple example we get the settings for every validate run.
  const settings = await getDocumentSettings(textDocument.uri);

  const document = textDocument.getText();
  const ext: string = path.extname(
    vscode_uri.default.parse(textDocument.uri).fsPath,
  );

  const engine: TextLintEngine = new TextLintEngine({
    configFile: path.resolve(__dirname, "../.textlintrc"),
  });

  const results: TextlintResult[] = await engine.executeOnText(document, ext);
  const diagnostics: Diagnostic[] = [];

  if (engine.isErrorResults(results)) {
    const messages: TextlintMessage[] = results[0].messages;

    const l: number = messages.length;
    for (let i: number = 0; i < l; i++) {
      const message: TextlintMessage = messages[i];
      const text: string = `${message.message}（${message.ruleId}）`;
      const pos: Position = Position.create(
        Math.max(0, message.line - 1),
        Math.max(0, message.column - 1),
      );

      // 対象チェック
      if (!isTarget(settings, message.ruleId)) {
        continue;
      }

      const diagnostic: Diagnostic = {
        severity: toDiagnosticSeverity(message.severity),
        range: Range.create(pos, pos),
        message: text,
        source: "テキスト校正くん",
        code: message.ruleId,
      };
      diagnostics.push(diagnostic);
    }
  }

  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

function isTarget(settings: ITextlintSettings, ruleId: string): boolean {
  let bool: boolean = false;
  switch (ruleId) {
    case "preset-japanese/no-dropping-the-ra":
      bool = settings.textlint.rule01;
      break;
    case "preset-jtf-style/1.2.2.ピリオド(.)とカンマ(,)":
      bool = settings.textlint.rule02;
      break;
    case "preset-jtf-style/2.1.8.算用数字":
      bool = settings.textlint.rule03;
      break;
    case "preset-jtf-style/3.1.2.全角文字どうし":
      bool = settings.textlint.rule04;
      break;
    case "preset-jtf-style/4.3.1.丸かっこ（）":
      bool = settings.textlint.rule05;
      break;
    case "preset-jtf-style/4.3.3.かぎかっこ「」":
      bool = settings.textlint.rule06;
      break;
    case "no-mix-dearu-desumasu":
      bool = settings.textlint.rule07;
      break;
    default:
      bool = true;
      break;
  }
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

function toDiagnosticSeverity(severity) {
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

interface ITextlintSettings {
  maxNumberOfProblems: number;
  textlint: IRuleId;
}

interface IRuleId {
  rule01: boolean;
  rule02: boolean;
  rule03: boolean;
  rule04: boolean;
  rule05: boolean;
  rule06: boolean;
  rule07: boolean;
}
