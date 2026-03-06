# ADR-0001: MCP サーバーから Go 製 CLI への移行

## Status: Accepted (2026-03-06)

## Context

redmine-api-mcp は TypeScript + Bun で実装された MCP サーバーとして Redmine REST API をラップしていた。
以下の課題があった：

1. MCP の高度な機能（双方向通信・リソース・サンプリング等）を使っておらず、単純な GET ラッパーにすぎない
2. 7ツール分のスキーマが毎メッセージ送信され、トークンコストが無駄
3. `.mcp.json` の設定が必要で、セットアップが煩雑
4. MCP サーバーとして常駐プロセスが必要

代替案として以下を検討した：

- **CLI 化（Go）**: シングルバイナリで配布、全OS対応、依存ゼロ
- **CLI 化（TypeScript + Bun のまま）**: 既存コード再利用で最速実装。ただし Bun ランタイムが必要
- **Skills に curl コマンドを直接書く**: CLI 不要で最もシンプル。ただし keyword 検索のフィルタ構文が複雑

## Decision

Go で CLI ツールとして書き直す。

理由：
- シングルバイナリで全OS対応、ユーザーのランタイム依存なし
- brew / mise / GitHub Releases で配布が完結（npm 等の外部レジストリ不要）
- CLI フレームワーク（cobra）が成熟しており、Go CLI のデファクトスタンダード
- goreleaser でクロスコンパイル・リリースが全自動
- Claude Code Skills からは Bash でコマンドを叩くだけで、MCP と同等の機能を提供

## Consequences

- TypeScript の既存コード（RedmineClient、Zod スキーマ、テスト）は再利用できず、Go で書き直しが必要
- リポジトリ名を `redmine-api-mcp` から `redmine-cli` にリネーム
- Homebrew 配布のため別リポ `homebrew-tap` の作成が必要（goreleaser が自動更新）
- MCP SDK への依存がなくなり、依存パッケージが大幅に減少
