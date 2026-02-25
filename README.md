# redmine-api-mcp

Redmine MCP Server — RedmineのチケットをAIツールから検索・閲覧できるMCPサーバー。

## セットアップ

`.mcp.json` に以下を追加：

```json
{
  "mcpServers": {
    "redmine": {
      "command": "bunx",
      "args": ["github:<user>/redmine-api-mcp"],
      "env": {
        "REDMINE_URL": "https://your-redmine.example.com",
        "REDMINE_API_KEY": "your-api-key"
      }
    }
  }
}
```

## 環境変数

| 変数名 | 必須 | 説明 |
|---|---|---|
| `REDMINE_URL` | Yes | RedmineサーバーのベースURL |
| `REDMINE_API_KEY` | Yes | Redmine APIキー |

## ツール一覧

| ツール | 説明 |
|---|---|
| `search_issues` | チケットをキーワード・フィルタで検索 |
| `get_issue` | チケットの詳細を取得 |
| `list_projects` | プロジェクト一覧を取得 |
| `list_trackers` | トラッカー一覧を取得 |
| `list_issue_statuses` | ステータス一覧を取得 |
| `list_issue_categories` | カテゴリ一覧を取得（要project_id） |
| `list_versions` | バージョン一覧を取得（要project_id） |

## 前提条件

- Bun ランタイム
- Redmine 5.1.0+（キーワード検索の `any_searchable` フィルタ使用のため）

## 開発

```bash
bun install
bun test
bun run check
bun run dev
```
