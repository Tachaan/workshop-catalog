# Workshop カタログ

GitHub / Copilot / Advanced Security / Agentic DevOps のハンズオン公開カタログです。
GitHub Pages で公開できる、ビルド不要のプレーンな静的サイト（HTML / CSS / JS + JSON データ）です。

## カテゴリ × レベル

| カテゴリ | Basic | Advanced |
|----------|:-----:|:--------:|
| **GH** — GitHub | ✓ | |
| **GHCP** — GitHub Copilot | ✓ | ✓ |
| **GHAS** — GitHub Advanced Security | ✓ | |
| **Agentic DevOps** | | ✓ |

## 構成

```
.
├── index.html                  # カタログのトップページ
├── assets/
│   ├── css/styles.css          # スタイル（レスポンシブ / ライト・ダーク対応）
│   └── js/catalog.js           # データ読込・フィルタ・検索・描画
├── data/workshops.json         # カタログデータ（ここを編集してworkshopを追加）
├── .nojekyll                   # Jekyll を無効化し静的配信
└── .github/workflows/deploy-pages.yml  # GitHub Actions で Pages へデプロイ
```

## 公開（GitHub Pages）

1. リポジトリの **Settings → Pages** を開く。
2. **Build and deployment → Source** を **GitHub Actions** に設定する。
3. `master` ブランチへ push すると `deploy-pages.yml` が実行され、自動的に公開されます。
   - 公開 URL の例: `https://<owner>.github.io/<repo>/`

> 手動デプロイは **Actions** タブから `Deploy catalog to GitHub Pages` を選び
> `Run workflow` でも実行できます。

## ワークショップの追加・編集

`data/workshops.json` の `workshops` 配列に項目を追加するだけです。HTML/JS の変更は不要です。

```json
{
  "id": "ghcp-advanced-mcp",
  "title": "Copilot ＋ MCP 連携ハンズオン",
  "category": "ghcp",
  "level": "advanced",
  "description": "MCP サーバを接続して Copilot を拡張する手順を学びます。",
  "tags": ["MCP", "拡張"],
  "duration": "約2時間",
  "url": "https://example.com/workshop"
}
```

| フィールド | 必須 | 説明 |
|------------|:----:|------|
| `id` | ✓ | 一意な識別子（英数字・ハイフン） |
| `title` | ✓ | ワークショップ名 |
| `category` | ✓ | `gh` / `ghcp` / `ghas` / `agentic-devops` のいずれか |
| `level` | ✓ | `basic` / `advanced` のいずれか |
| `description` | | 概要説明 |
| `tags` | | タグの配列（検索対象） |
| `duration` | | 所要時間の目安 |
| `url` | | リンク先 URL。`#` または空にすると「準備中」表示になります |

### カテゴリ・レベルの追加

`data/workshops.json` の `categories` / `levels` を編集します。各カテゴリの
`levels` 配列が、対応マトリクスとフィルタに反映されます。`color` はバッジ色です。

## ローカルでの確認

`fetch` で JSON を読み込むため、ファイルを直接開くのではなく HTTP サーバ経由で開いてください。

```bash
# Python が入っている場合
python -m http.server 8000
# → ブラウザで http://localhost:8000 を開く
```

## ライセンス

社内・コミュニティでの利用を想定したサンプルです。掲載 URL は初期サンプルのため、
実際のワークショップへのリンクに置き換えてください。
