#!/bin/bash

# バックエンドサーバーを起動するスクリプト

# 仮想環境をアクティベート
source venv/bin/activate

# サーバーを起動
uvicorn main:app --reload --host 0.0.0.0 --port 8000

