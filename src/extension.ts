import * as path from "path";
import { ExtensionContext, workspace } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const serverModule = context.asAbsolutePath(path.join("out", "server.js"));
  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [
      { scheme: "file", language: "review" },
      { scheme: "file", language: "plaintext" },
      { scheme: "file", language: "markdown" },
    ],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contain in the workspace
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };
  client = new LanguageClient(
    "languageServerTextlint",
    "Language Server Textlint",
    serverOptions,
    clientOptions,
  );
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
