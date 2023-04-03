/* eslint-disable prettier/prettier */
import * as path from "path";
// eslint-disable-next-line import/named
import { TextlintMessage, TextlintResult } from "@textlint/kernel";
import { createLinter, loadTextlintrc } from "textlint";
import { TextDocument } from "vscode-languageserver-textdocument";
import { configPath } from "textlint-rule-preset-icsmedia";
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
  CodeActionKind,
  CodeAction,
  TextDocumentEdit,
  TextEdit,
  CodeActionParams,
} from "vscode-languageserver/node";
import { URI } from "vscode-uri";
import * as HTMLPlugin from "textlint-plugin-html";
import LatexPlugin from "textlint-plugin-latex2e";
import ReviewPlugin from "textlint-plugin-review";
import { DEFAULT_EXTENSION_RULES } from "./rules/rule";

const APP_NAME = "テキスト校正くん";

// サーバーへの接続を作成(すべての提案された機能も含む)
const connection = createConnection(ProposedFeatures.all);
// テキストドキュメントを管理するクラスを作成します。
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;
  hasConfigurationCapability =
    (capabilities.workspace && !!capabilities.workspace.configuration) ?? false;

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      codeActionProvider: true, // connection.onCodeAction を有効にする
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

/**
 * コードアクションのハンドラです。
 * クイックフィックス機能の追加を行っています。
 */
connection.onCodeAction((params: CodeActionParams) => {
  const textDocument = documents.get(params.textDocument.uri);
  // コードアクションの種類にクイックフィックスが存在するか？
  const isQuickFix = params.context.only?.some((kind) => kind === CodeActionKind.QuickFix) ?? false;
  if (!textDocument || !isQuickFix) {
    return;
  }

  // 診断結果
  const diagnostics = params.context.diagnostics.filter(v => v.source === APP_NAME);
  const codeActions: CodeAction[] = [];

  // クイックフィックスの追加
  diagnostics.forEach((diagnostic: Diagnostic) => {
    const quickFixAction = createQuickFixAction(diagnostic, textDocument)
    if(!quickFixAction) {
      return;
    }
    codeActions.push(quickFixAction);
  })

  return codeActions;
});

const getDefaultTextlintSettings = () => {
  const mySettings: { [key: string]: boolean } = {};

  DEFAULT_EXTENSION_RULES.forEach((value) => {
    mySettings[value.ruleName] = value.enabled;
  });

  return mySettings;
};

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
const getDocumentSettings = (resource: string): Thenable<ITextlintSettings> => {
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
};

// Only keep settings for open documents
documents.onDidClose((close) => {
  documentSettings.delete(close.document.uri);
  resetTextDocument(close.document);
});

// ドキュメントを初めて開いた時と内容に変更があった際に実行します。
documents.onDidChangeContent(async (change) => {
  validateTextDocument(change.document);
});

// バリデーション（textlint）を実施
const validateTextDocument = async (
  textDocument: TextDocument,
): Promise<void> => {
  // VSCode側の設定を取得
  const settings = await getDocumentSettings(textDocument.uri);

  const document = textDocument.getText();

  // ICS MEDIAのルールのtextlintの設定ファイルを読み込み
  const defaultDescriptor = await loadTextlintrc({
    configFilePath: configPath,
  });

  // デフォルトのプラグイン設定を取得。テキスト・マークダウン用のプラグインなどが入っている想定
  const defalutPluginSettings = defaultDescriptor.toKernelOptions().plugins;

  // 追加のプラグイン設定
  const extendPlugins = [
    {
      pluginId: "@textlint/textlint-plugin-html",
      plugin: HTMLPlugin,
    },
    {
      pluginId: "@textlint/textlint-plugin-latex2e",
      plugin: LatexPlugin,
    },
    {
      pluginId: "@textlint/textlint-plugin-review",
      plugin: ReviewPlugin,
    },
  ];

  let descriptor;

  if (defalutPluginSettings) {
    descriptor = defaultDescriptor.shallowMerge({
      plugins: [...defalutPluginSettings, ...extendPlugins],
    });
  } else {
    descriptor = defaultDescriptor.shallowMerge({
      plugins: [...extendPlugins],
    });
  }

  // ファイルの拡張子
  const ext: string = path.extname(textDocument.uri);
  // サポートされている拡張子
  const targetExtension = descriptor.availableExtensions.find((i) => i === ext) ?? null;

  // 対応していない拡張子の場合、バリデーションを実行しない
  if (targetExtension === null) {
    return;
  }

  const linter = createLinter({
    descriptor,
  });
  const results: TextlintResult = await linter.lintText(
    document,
    URI.parse(textDocument.uri).fsPath,
  );
  const diagnostics: Diagnostic[] = [];

  // エラーが存在する場合
  if (results.messages.length) {
    // エラーメッセージ一覧を取得
    const messages: TextlintMessage[] = results.messages;
    const l: number = messages.length;
    for (let i = 0; i < l; i++) {
      const message: TextlintMessage = messages[i];
      const text = `${message.message}（${message.ruleId}）`;

      // 有効とされているエラーか？
      if (!isTarget(settings, message.ruleId, message.message)) {
        continue;
      }

      // エラー範囲の開始位置のズレ
      let startCharacterDiff = 0;

      // エラーのルールが「不自然な濁点」か？
      const isRuleNoNfd = message.ruleId === "japanese/no-nfd";
      if(isRuleNoNfd) {
        // ルール「不自然な濁点」は、修正テキストを1文字ずらして生成していると思われるため、エラー開始位置も1文字ずらしたい
        startCharacterDiff = -1;
      }

      // エラーの文字数を取得します。
      // 文字数が存在しない場合の値は1になります。
      const posRange = message.fix?.range
        ? message.fix.range[1] - message.fix.range[0]
        : 1;
      // エラーの開始位置を取得します。
      const startPos = Position.create(
        Math.max(0, message.loc.start.line - 1),
        Math.max(0, message.loc.start.column - 1 + startCharacterDiff),
      );
      // エラーの終了位置を取得します。
      const endPos = Position.create(
        Math.max(0, message.loc.end.line - 1),
        Math.max(0, message.loc.start.column - 1 + startCharacterDiff + posRange),
      );
      const canAutofixMessage = message.fix ? "🪄 " : "";
      // 診断結果を作成
      const diagnostic: Diagnostic = {
        severity: toDiagnosticSeverity(message.severity),
        range: Range.create(startPos, endPos),
        message: canAutofixMessage + text,
        source: APP_NAME,
        code: message.ruleId,
        data: message.fix?.text,
      };
      diagnostics.push(diagnostic);
    }
  }
  // 診断結果をVSCodeに送信し、ユーザーインターフェースに表示します。
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
};

/**
 * 設定で有効としているエラーかどうか判定します。
 * @param settings VSCode側の設定
 * @param targetRuleId エラーのルールID
 * @param message エラーメッセージ
 * @returns
 */
const isTarget = (
  settings: ITextlintSettings,
  targetRuleId: string,
  message: string,
): boolean => {
  let bool = false;
  DEFAULT_EXTENSION_RULES.forEach((rule) => {
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
};

/**
 * validate済みの内容を破棄します。
 * @param textDocument
 */
const resetTextDocument = async (textDocument: TextDocument): Promise<void> => {
  const diagnostics: Diagnostic[] = [];
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
};

const toDiagnosticSeverity = (severity: number) => {
  switch (severity) {
    case 0:
      return DiagnosticSeverity.Information;
    case 1:
      return DiagnosticSeverity.Warning;
    case 2:
      return DiagnosticSeverity.Error;
  }
  return DiagnosticSeverity.Information;
};

/**
 * 診断結果の自動修正が可能な場合、クイックフィックスのコードアクションを作成します。
 * @param diagnostic
 * @param textDocument
 */
const createQuickFixAction = (diagnostic: Diagnostic, textDocument: TextDocument) => {
  // 自動修正できない場合はコードアクションを生成しない
  if(diagnostic.data === undefined) {
    return;
  }

  // コードアクションを生成
  const textEdits: TextEdit[] = [TextEdit.replace(diagnostic.range, diagnostic.data)];
  const documentChanges = {
    documentChanges: [
      TextDocumentEdit.create(
        {
          uri: textDocument.uri,
          version: textDocument.version
        },
        textEdits,
      )
    ],
  };

  const fixAction = CodeAction.create(
    "問題を自動修正する（テキスト校正くん）",
    documentChanges,
    CodeActionKind.QuickFix
  );

  // 作成したクイックフィックスのアクションを診断結果と紐付ける
  fixAction.diagnostics = [diagnostic];

  return fixAction;
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
