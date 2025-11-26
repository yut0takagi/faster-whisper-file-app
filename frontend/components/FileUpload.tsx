'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  onTranscriptGenerated: (transcript: string) => void;
}

export default function FileUpload({ onTranscriptGenerated }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelSize, setModelSize] = useState('base');
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('ファイルを選択してください');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model_size', modelSize);
      formData.append('language', 'ja');

      const response = await fetch(api.transcribe, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '文字起こしに失敗しました');
      }

      const data = await response.json();
      onTranscriptGenerated(data.transcript);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📤 音声ファイルをアップロード</CardTitle>
        <CardDescription>
          音声ファイルをアップロードして文字起こしを開始します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model-size">モデルサイズ</Label>
          <Select value={modelSize} onValueChange={setModelSize} disabled={isUploading}>
            <SelectTrigger id="model-size">
              <SelectValue placeholder="モデルサイズを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tiny">Tiny</SelectItem>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audio-file">音声ファイル</Label>
          <Input
            id="audio-file"
            type="file"
            accept=".wav,.mp3,.m4a,.aac,.flac,.ogg"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        {file && (
          <div className="text-sm text-muted-foreground">
            選択中: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isUploading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">
              文字起こし中... {progress}%
            </p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
          size="lg"
        >
          {isUploading ? '処理中...' : '文字起こしを開始'}
        </Button>
      </CardContent>
    </Card>
  );
}
