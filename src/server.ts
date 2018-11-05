import { TextlintMessage, TextlintResult } from "@textlint/kernel";
import * as path from "path";
import { TextLintEngine } from "textlint";
import { rules } from "./rules/rule";

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

function getDefaultTextlintSettings() {
  const mySettings = new Map<string, boolean>();

  rules.forEach((value, index, array) => {
    mySettings[value.ruleName] = value.enabled;
  });

  return mySettings;
}

const defaultSettings: ITextlintSettings = {
  maxNumberOfProblems: 1000,
  textlint: getDefaultTextlintSettings()
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
      if (!isTarget(settings, message.ruleId, message.message)) {
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

function isTarget(
  settings: ITextlintSettings,
  ruleId: string,
  message: string,
): boolean {
  let bool: boolean = false;
  rules.forEach((element, index, array) => {
    // prhのとき、ruleIdからprh内の細かいルールを取得できないのでmessageに含まれているか取得している
    if (ruleId === "prh") {
      const ruleIdSub = element.ruleId.split("/")[1];
      if (message.includes(`（${ruleIdSub}）`)) {
        bool = settings.textlint[element.ruleName];
      }
    } else if (element.ruleId === ruleId) {
      bool = settings.textlint[element.ruleName];
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
  textlint: Map<string, boolean>;
}
