# redmine-cli

Redmine REST API を操作する Go 製 CLI ツール。

## インストール

### Homebrew (macOS)
```bash
brew install chippy-ao/tap/redmine-cli
```

### mise (macOS/Linux)
```bash
mise use -g chippy-ao/redmine-cli
```

### go install
```bash
go install github.com/chippy-ao/redmine-cli@latest
```

### GitHub Releases
https://github.com/chippy-ao/redmine-cli/releases から各OS向けバイナリをダウンロード。

## セットアップ

```bash
# プロファイルを追加
redmine-cli config add work --url https://redmine.example.com --api-key YOUR_API_KEY

# デフォルトプロファイルを設定（最初に追加したものが自動でデフォルトになる）
redmine-cli config set-default work

# プロファイル一覧
redmine-cli config list
```

## 使い方

### チケット検索
```bash
redmine-cli search --keyword "バグ" --status open
redmine-cli search --project myproject --assigned-to me
redmine-cli search --keyword "ログイン" --tracker-id 1 --limit 10
```

### チケット詳細
```bash
redmine-cli get-issue 1234
redmine-cli get-issue 1234 --include journals,children
```

### 一覧取得
```bash
redmine-cli projects
redmine-cli trackers
redmine-cli statuses
redmine-cli categories --project myproject
redmine-cli versions --project myproject
```

### 複数環境の切り替え
```bash
redmine-cli --profile work search --keyword "タスク"
redmine-cli --profile oss search --keyword "issue"
```

## 出力

すべてのコマンドは JSON を stdout に出力します。エラーは stderr に出力されます。

## 前提条件

- Redmine 5.1.0+（keyword 検索に `any_searchable` フィルタを使用）

## ライセンス

MIT
