# Contributing to Faster-Whisper Transcriber

まずは、**Faster-Whisper Transcriber** に興味を持っていただきありがとうございます！🎉

このプロジェクトをより良くするために、バグ報告、機能追加、ドキュメントの改善など、あらゆる形の貢献を歓迎します。

## 🤝 貢献の方法

### 1. バグ報告 (Bug Reports)

バグを見つけた場合は、[Issues](https://github.com/yut0takagi/faster-whisper-file-app/issues) で報告してください。
報告の際は、以下の情報を含めていただけると助かります：

- **バグの概要**: 何が起きたのか簡潔に。
- **再現手順**: バグを再現するためのステップ。
- **期待される動作**: 本来どうあるべきだったか。
- **環境情報**: OS、ブラウザ、Dockerのバージョンなど。
- **スクリーンショット**: エラー画面などがあれば。

### 2. 機能リクエスト (Feature Requests)

新しい機能のアイデアがあれば、[Issues](https://github.com/yut0takagi/faster-whisper-file-app/issues) で提案してください。「Feature Request」ラベルを使用してください。

### 3. プルリクエスト (Pull Requests)

コードを修正したり機能を追加したい場合は、プルリクエスト (PR) を送ってください。

1. リポジトリを **Fork** します。
2. 作業用のブランチを作成します (`git checkout -b feature/amazing-feature`)。
3. 変更を加えます。
4. 変更をコミットします (`git commit -m 'Add some amazing feature'`)。
   - コミットメッセージは具体的かつ簡潔にお願いします。
5. あなたのフォークにプッシュします (`git push origin feature/amazing-feature`)。
6. **Pull Request** を作成します。

## 🛠️ 開発環境のセットアップ

ローカルで開発を行う手順は以下の通りです。

### 必須要件

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (推奨)

### セットアップ手順

1. リポジトリをクローンします。
   ```bash
   git clone https://github.com/YOUR_USERNAME/faster-whisper-file-app.git
   cd faster-whisper-file-app
   ```

2. フロントエンドの依存関係をインストールします。
   ```bash
   cd frontend
   npm install
   ```

3. バックエンドの仮想環境を作成し、依存関係をインストールします。
   ```bash
   cd ../backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. 開発サーバーを起動します。
   
   **バックエンド:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   **フロントエンド:**
   ```bash
   npm run dev
   ```

## 🎨 コーディングスタイル

- **Frontend**: TypeScript, Tailwind CSS, ESLintの設定に従ってください。
- **Backend**: PEP 8 に準拠した Python コードを心がけてください。

## 📜 ライセンス

このプロジェクトへの貢献は、プロジェクトの [MITライセンス](LICENSE) の下で公開されることに同意したものとみなされます。

---

素晴らしい貢献をお待ちしています！🚀

