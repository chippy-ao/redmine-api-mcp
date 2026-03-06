# ADR-0003: プロファイル方式による認証管理

## Status: Accepted (2026-03-06)

## Context

Redmine API への接続には URL と API キーが必要。管理方法として以下を検討した：

| 方法 | メリット | デメリット |
|------|----------|------------|
| 環境変数のみ | シンプル、CI/CD と相性良い | 複数環境の切替が面倒 |
| 設定ファイル（プロファイル方式） | `--profile` で複数環境を簡単に切替 | 設定ファイル管理が必要 |
| 両方対応 | 柔軟 | 実装が複雑 |

## Decision

設定ファイルによるプロファイル方式を採用。

設定ファイルの形式は YAML（`~/.config/redmine-cli/config.yaml`）。
Go CLI では YAML が一般的で、gh CLI も YAML を採用している。

```yaml
default_profile: work
profiles:
  work:
    url: https://redmine.company.com
    api_key: abc123
```

## Consequences

- ユーザーは初回に `redmine-cli config add` でプロファイルを設定する必要がある
- 複数の Redmine 環境を `--profile` フラグで簡単に切り替え可能
- API キーはファイルに保存されるため、ファイルパーミッションによるセキュリティ管理が必要
- CI/CD での利用時は設定ファイルの生成が必要（将来的に環境変数でのオーバーライドも検討）
