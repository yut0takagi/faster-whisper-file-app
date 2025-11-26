# 🎧 Faster-Whisper File Transcriber

音声ファイルをアップロードして、Faster-Whisperで文字起こしを行い、LMStudio APIを使って議事録を生成するアプリケーションです。

## ✨ 機能

| 機能 | 説明 |
|------|------|
| **📤 ファイルアップロード** | `.wav`, `.mp3`, `.m4a`, `.aac`, `.flac`, `.ogg` 形式の音声ファイルに対応 |
| **🚀 Faster-Whisper** | [faster-whisper](https://github.com/guillaumekln/faster-whisper) による高速文字起こし（CPU/GPU対応） |
| **📊 進捗表示** | リアルタイムで処理進捗を表示 |
| **🔀 モデル選択** | `tiny` / `base` / `small` / `medium` / `large` から選択可能 |
| **📝 Markdown出力** | 文末記号（`。！？!?`）で分割されたMarkdown形式でダウンロード可能 |
| **📋 議事録生成** | LMStudio APIを使用して文字起こし結果を議事録として自動整理 |
| **⚙️ API設定** | LMStudio APIの接続テストとモデル一覧取得機能 |
| **🎨 モダンUI** | Next.js + shadcn/uiによる美しいユーザーインターフェース |

---

## 🏗️ アーキテクチャ

- **フロントエンド**: Next.js 16+ (React 19, TypeScript, Tailwind CSS, shadcn/ui)
- **バックエンド**: FastAPI (Python 3.11+)
- **文字起こしエンジン**: Faster-Whisper
- **議事録生成**: LMStudio API

---

## 🚀 クイックスタート

### Docker Compose（推奨）

最も簡単な起動方法：

```bash
# リポジトリをクローン
git clone https://github.com/yut0takagi/faster-whisper-file-app.git
cd faster-whisper-file-app

# Docker Composeで起動
docker compose up --build
```

これで以下が起動します：
- **フロントエンド**: http://localhost:3000
- **バックエンド**: http://localhost:8000

> **Tip:** 初回起動時はFaster-Whisperのモデルがダウンロードされます（`base`モデルで約75MB）。`model_cache`ボリュームに保存されるため、2回目以降は高速に起動します。

### ローカル開発環境

#### 1. バックエンドのセットアップ

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. フロントエンドのセットアップ

```bash
cd frontend
npm install
```

#### 3. 起動

**バックエンドを起動**（ターミナル1）:

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

**フロントエンドを起動**（ターミナル2）:

```bash
cd frontend
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

---

## 📋 使用方法

### 1. LMStudioのセットアップ

1. [LMStudio](https://lmstudio.ai/) をインストールして起動
2. 使用したいモデルをダウンロード
3. 「Local Server」タブで「Start Server」をクリック
4. 表示されたAPI URLとモデル名を確認（例: `http://localhost:1234`、モデル: `openai/gpt-oss-20b`）

### 2. アプリの設定

1. サイドバーの「⚙️ 設定」で以下を入力：
   - **LMStudio API URL**: `http://localhost:1234/v1/chat/completions`
   - **LMStudio モデル名**: 使用するモデル名（例: `openai/gpt-oss-20b`）
2. 「🔌 API接続をテスト」ボタンで接続を確認
3. （オプション）「議事録を自動生成」にチェックを入れる

### 3. 文字起こし

1. 「📤 音声ファイルをアップロード」セクションで：
   - モデルサイズを選択（推奨: `base`）
   - 音声ファイルを選択
   - 「文字起こしを開始」をクリック
2. 処理が完了すると、文字起こし結果が表示されます
3. 「📥 Markdown をダウンロード」で結果を保存

### 4. 議事録生成

1. 文字起こし完了後、「📋 議事録生成」セクションで：
   - 「🔍 議事録を生成」をクリック（自動生成がオフの場合）
   - または、自動生成がオンの場合は自動で生成されます
2. 生成された議事録を確認
3. 「📥 議事録をダウンロード」で保存

---

## 🐳 Docker詳細

### サービス構成

- **backend**: FastAPI + Faster-Whisper
  - ポート: 8000
  - モデルキャッシュ: `model_cache` ボリュームに永続化

- **frontend**: Next.js
  - ポート: 3000
  - ホットリロード対応（ソースコード変更を自動反映）

### GPUサポート

NVIDIA GPUを使用する場合、`docker-compose.yml`の`backend`サービスに以下を追加：

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

### ログの確認

```bash
# すべてのサービスのログ
docker compose logs -f

# 特定のサービスのログ
docker compose logs -f backend
docker compose logs -f frontend
```

### 停止・削除

```bash
# 停止
docker compose down

# 停止 + ボリューム削除（モデルキャッシュも削除）
docker compose down -v
```

---

## 📂 プロジェクト構造

```
faster-whisper-file-app/
├── frontend/                 # Next.jsフロントエンド
│   ├── app/                  # App Router
│   │   ├── page.tsx         # メインページ
│   │   └── globals.css      # グローバルスタイル
│   ├── components/          # Reactコンポーネント
│   │   ├── ui/              # shadcn/uiコンポーネント
│   │   ├── FileUpload.tsx   # ファイルアップロード
│   │   ├── Settings.tsx     # 設定パネル
│   │   ├── TranscriptView.tsx # 文字起こし結果表示
│   │   └── MinutesView.tsx  # 議事録表示
│   ├── lib/                 # ユーティリティ
│   │   ├── api.ts           # API設定
│   │   └── utils.ts         # 共通関数
│   ├── package.json
│   └── Dockerfile
├── backend/                  # FastAPIバックエンド
│   ├── main.py              # APIエンドポイント
│   ├── requirements.txt     # Python依存関係
│   └── Dockerfile
├── docker-compose.yml        # Docker Compose設定
├── whisper_file_app.py       # 旧Streamlit版（参考用）
└── readme.md                 # このファイル
```

---

## ⚙️ 環境変数

### バックエンド

- `HF_HOME`: Hugging Faceキャッシュディレクトリ（デフォルト: `/root/.cache/huggingface`）
- `PORT`: サーバーポート（デフォルト: 8000）

### フロントエンド

- `NEXT_PUBLIC_API_URL`: バックエンドAPIのURL（デフォルト: `http://localhost:8000`）
- `HOSTNAME`: サーバーのホスト名（Docker用: `0.0.0.0`）

---

## 🔧 ハードウェア要件

| ハードウェア | 推奨設定 | 備考 |
|------------|---------|------|
| CPU only | `int8` (自動選択) | 1-10分の音声ファイルで実用的 |
| NVIDIA GPU | `float16` (自動検出) | CUDA対応GPUで高速処理 |
| Apple Silicon M-series | `int8` (CPU) | Metalサポートは未対応 |

GPUが検出できない場合、自動的にCPU `int8`モードにフォールバックします。

---

## ✂️ 文分割ロジック

文字起こし結果は以下の正規表現で文末記号を基準に分割されます：

```python
sentences = re.split(r"(?<=[。！？!?])", raw_text)
formatted = "\n\n".join(s.strip() for s in sentences if s.strip())
```

必要に応じて正規表現を調整してください。

---

## 🐛 トラブルシューティング

### ポートが既に使用されている場合

`docker-compose.yml`でポート番号を変更：

```yaml
ports:
  - "8001:8000"  # バックエンド
  - "3001:3000"  # フロントエンド
```

### フロントエンドがバックエンドに接続できない場合

1. バックエンドが正常に起動しているか確認：
   ```bash
   curl http://localhost:8000/
   ```

2. ブラウザの開発者ツール（F12）でネットワークエラーを確認

3. `NEXT_PUBLIC_API_URL`環境変数が正しいか確認

### LMStudio API接続エラー

1. LMStudioで「Start Server」が押されているか確認
2. API URLとポート番号が正しいか確認
3. モデル名が正しいか確認（「📋 利用可能なモデルを取得」で確認可能）

---

## 📜 ライセンス

MIT © 2025 Yuto TAKAGI

---

## 🙏 謝辞

* [faster-whisper](https://github.com/guillaumekln/faster-whisper) – 高速なWhisper推論エンジン
* [Next.js](https://nextjs.org/) – Reactフレームワーク
* [shadcn/ui](https://ui.shadcn.com/) – 美しいUIコンポーネント
* [FastAPI](https://fastapi.tiangolo.com/) – モダンなPython Webフレームワーク
* [LMStudio](https://lmstudio.ai/) – ローカルLLM実行環境
* [OpenAI Whisper](https://github.com/openai/whisper) – 音声認識モデル
