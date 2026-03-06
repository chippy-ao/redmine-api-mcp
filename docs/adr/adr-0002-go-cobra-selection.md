# ADR-0002: Go + cobra の採用

## Status: Accepted (2026-03-06)

## Context

CLI ツールの言語・フレームワーク選定。以下を検討した：

### 言語

| 言語 | メリット | デメリット |
|------|----------|------------|
| Go | シングルバイナリ、クロスコンパイル、起動爆速（数ms）、依存ゼロ | 既存 TS コード再利用不可 |
| TypeScript + Bun | 既存コード再利用、変更量最小 | Bun ランタイム必要、クロスコンパイル不安定 |
| TypeScript + Node.js | 広い普及率 | ビルドステップ必要、起動遅い |
| Rust | Go と同等 + さらに高速 | 学習コスト高い |

### CLI フレームワーク（Go）

| フレームワーク | GitHub Stars | 採用実績 |
|--------------|-------------|---------|
| cobra | 39k+ | gh, kubectl, docker, hugo, terraform |
| urfave/cli | 22k+ | nerdctl, gitea |
| kong | 2k+ | 採用実績少なめ |

## Decision

Go + cobra を採用。

言語の理由：
- CLI ツールとしてのユーザー体験が最も良い（シングルバイナリ、依存ゼロ）
- 配布が GitHub だけで完結（brew tap、GitHub Releases）
- gh CLI 等の実績のあるパターンに倣える

フレームワークの理由：
- Go CLI のデファクトスタンダード
- サブコマンド、フラグ解析、help 自動生成、シェル補完生成が全部入り
- 情報量が圧倒的に多い

## Consequences

- Go の開発環境が必要（Go 1.22+）
- TypeScript の知識は活かせないが、ロジック自体はシンプルなので移植は容易
- goreleaser との相性が良く、CI/CD パイプラインの構築が簡単
