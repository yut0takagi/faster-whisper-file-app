# 🎧 Faster-Whisper File Transcriber (Next.js版)

音声ファイルをアップロードして、Faster-Whisperで文字起こしを行い、LMStudio APIを使って議事録を生成するアプリケーションです。

## 🏗️ アーキテクチャ

- **フロントエンド**: Next.js 14+ (React, TypeScript, Tailwind CSS)
- **バックエンド**: FastAPI (Python)
- **文字起こしエンジン**: Faster-Whisper
- **議事録生成**: LMStudio API

## ✨ 機能

- 📤 音声ファイルのアップロード（wav, mp3, m4a, aac, flac, ogg）
- 🚀 Faster-Whisperによる高速文字起こし
- 📊 リアルタイム進捗表示
- 📝 Markdown形式でのダウンロード
- 📋 LMStudio APIを使った議事録自動生成
- ⚙️ LMStudio API設定と接続テスト

## 🚀 セットアップ

### 1. バックエンドのセットアップ

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. フロントエンドのセットアップ

```bash
cd frontend
npm install
```

### 3. 起動

#### バックエンドを起動

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

#### フロントエンドを起動

別のターミナルで:

```bash
cd frontend
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 📋 使用方法

1. **LMStudioのセットアップ**
   - LMStudioを起動
   - 「Local Server」タブで「Start Server」をクリック
   - API URLとモデル名を確認

2. **アプリの設定**
   - サイドバーでLMStudio API URLとモデル名を入力
   - 「🔌 API接続をテスト」で接続を確認

3. **文字起こし**
   - 音声ファイルをアップロード
   - モデルサイズを選択
   - 「文字起こしを開始」をクリック

4. **議事録生成**
   - 文字起こし完了後、「議事録を生成」をクリック
   - または「議事録を自動生成」を有効にする

## 🐳 Docker（オプション）

バックエンドをDockerで実行する場合:

```bash
cd backend
docker build -t faster-whisper-api .
docker run -p 8000:8000 faster-whisper-api
```

## 📂 プロジェクト構造

```
faster-whisper-file-app/
├── frontend/          # Next.jsフロントエンド
│   ├── app/          # App Router
│   ├── components/   # Reactコンポーネント
│   └── package.json
├── backend/          # FastAPIバックエンド
│   ├── main.py      # APIエンドポイント
│   └── requirements.txt
└── README_NEXTJS.md
```

## 🔧 環境変数

バックエンドの環境変数（オプション）:

- `PORT`: サーバーポート（デフォルト: 8000）
- `CORS_ORIGINS`: CORS許可オリジン（カンマ区切り）

## 📝 ライセンス

MIT © 2025 Yuto TAKAGI

