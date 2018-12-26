# 「テキスト校正くん」の開発について

## 開発環境の構築

1. VS Codeで本プロジェクトのルートディレクトリを開いてください。
2. ターミナルから`npm i`で必要なパッケージをインストールしてください。
3. VS Codeで[F5]キーを押下しデバッグ実行を行うと、開発中の拡張機能がインストールされた状態でVS Codeが立ち上がります。

## 拡張機能の公開

### 公開ツール（vsce）のインストール

以下のコマンドを実行し、公開ツールをインストールしてください。

　　`npm i -g vsce`

### 拡張機能のパッケージング

拡張機能を公開せずにパッケージ化できます。
公開前に内部確認する際や非公開の拡張機能を作成する際に利用します。

`vsce package`

### 拡張機能の公開

Visual Studio Team Servicesを活用して、拡張機能の公開を行います。
公開するには、Personal Access Tokensが必要であるため、以下のサイトの通り設定をしてください。
https://vscode-doc-jp.github.io/docs/extensions/publish-extension.html

Personal Access Tokens設定後、拡張機能の公開は以下のコマンドで行います。

`vsce publish`
