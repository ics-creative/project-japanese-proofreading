import {TextlintMessage, TextlintResult} from "@textlint/kernel";
import * as path from "path";
import {TextLintEngine} from "textlint";
import {
	createConnection, Diagnostic, DiagnosticSeverity, DidChangeConfigurationNotification, InitializeParams,
	Position, ProposedFeatures, Range, TextDocument, TextDocuments,
} from "vscode-languageserver";
import * as vscode_uri from "vscode-uri";

// サーバーへの接続を作成(すべての提案された機能も含む)
const connection = createConnection(ProposedFeatures.all);

// テキストドキュメントを管理するクラスを作成します。
const documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean | undefined = false;

connection.onInitialize((params: InitializeParams) => {
	console.log("initialize");
	const capabilities = params.capabilities;
	hasConfigurationCapability = capabilities.workspace && !!capabilities.workspace.configuration;

	return {
		capabilities: {
			textDocumentSync: documents.syncKind,
            completionProvider: {
                resolveProvider: true,
            },
		},
	};
});

connection.onInitialized(() => {
	console.log("initialized");
	if (hasConfigurationCapability) {
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
});

const defaultSettings: TextlintSettings = { maxNumberOfProblems: 1000 };
let globalSettings: TextlintSettings = defaultSettings;
const documentSettings: Map<string, Thenable<TextlintSettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
	console.log("onDidChangeConfiguration");
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = (change.settings.textlintConfig || defaultSettings) as TextlintSettings;
	}

	// Revalidate all open text documents
	documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<TextlintSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({ scopeUri: resource, section: "textlintConfig" });
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose((e) => {
	documentSettings.delete(e.document.uri);
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
	const ext: string = path.extname(vscode_uri.default.parse(textDocument.uri).fsPath);

 console.log("validate!!");

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
			const text: string = message.ruleId ? `${message.message} (${message.ruleId})` : message.message;
			const pos: Position = Position.create(Math.max(0, message.line - 1), Math.max(0, message.column - 1));

			const diagnostic: Diagnostic = {
				severity: toDiagnosticSeverity(message.severity),
				range: Range.create(pos, pos),
				message: text,
				source: "japanese-proofreading",
				code: message.ruleId,
			};
			diagnostics.push(diagnostic);
		}
	}

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

function toDiagnosticSeverity(severity) {
	switch (severity) {
			case 0: return DiagnosticSeverity.Information;
			case 1: return DiagnosticSeverity.Warning;
			case 2: return DiagnosticSeverity.Error;
	}
	return DiagnosticSeverity.Information;
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();

interface TextlintSettings {
	maxNumberOfProblems: number;
}
