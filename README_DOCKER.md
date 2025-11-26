# 🐳 Docker Compose での起動方法

## クイックスタート

```bash
docker compose up --build
```

これで以下が起動します：
- **バックエンド**: http://localhost:8000 (FastAPI)
- **フロントエンド**: http://localhost:3000 (Next.js)

## 詳細

### サービス構成

- **backend**: FastAPI + Faster-Whisper
  - ポート: 8000
  - モデルキャッシュ: `model_cache` ボリュームに永続化

- **frontend**: Next.js
  - ポート: 3000
  - ホットリロード対応（ソースコード変更を自動反映）

### 環境変数

#### バックエンド
- `HF_HOME`: Hugging Faceキャッシュディレクトリ（デフォルト: `/root/.cache/huggingface`）

#### フロントエンド
- `NEXT_PUBLIC_API_URL`: バックエンドAPIのURL（デフォルト: `http://localhost:8000`）
- `HOSTNAME`: サーバーのホスト名（Docker用: `0.0.0.0`）

### ボリューム

- `model_cache`: Faster-Whisperのモデルファイルを永続化

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

または、`docker compose`コマンドに`--gpus all`を追加：

```bash
docker compose --profile gpu up --build
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

# 停止 + ボリューム削除
docker compose down -v
```

## トラブルシューティング

### ポートが既に使用されている場合

`docker-compose.yml`でポート番号を変更：

```yaml
ports:
  - "8001:8000"  # バックエンド
  - "3001:3000"  # フロントエンド
```

### モデルのダウンロードが遅い場合

初回起動時、Faster-Whisperのモデルがダウンロードされます。`model_cache`ボリュームに保存されるため、2回目以降は高速に起動します。

### フロントエンドがバックエンドに接続できない場合

1. バックエンドが正常に起動しているか確認：
   ```bash
   curl http://localhost:8000/
   ```

2. ブラウザの開発者ツールでネットワークエラーを確認

3. `NEXT_PUBLIC_API_URL`環境変数が正しいか確認

