import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	let serverModule = context.asAbsolutePath(path.join('out', 'server.js'));
	let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
	let serverOptions: ServerOptions = {
		run : { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	};
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{scheme: 'file', language: 'plaintext'}, {scheme: 'file', language: 'markdown'}],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contain in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc'),
		}
	};
	client = new LanguageClient('languageServerExample', 'Language Server Example', serverOptions, clientOptions);
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}