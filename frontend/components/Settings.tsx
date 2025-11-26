'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SettingsProps {
  settings: {
    lmstudioUrl: string;
    lmstudioModel: string;
    autoGenerateMinutes: boolean;
  };
  onSettingsChange: (settings: {
    lmstudioUrl: string;
    lmstudioModel: string;
    autoGenerateMinutes: boolean;
  }) => void;
}

export default function Settings({ settings, onSettingsChange }: SettingsProps) {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(
        api.testConnection(settings.lmstudioUrl, settings.lmstudioModel)
      );

      const data = await response.json();
      if (response.ok) {
        setTestResult({ success: true, message: '✅ API接続成功' });
      } else {
        setTestResult({ success: false, message: `❌ エラー: ${data.detail}` });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `❌ 接続失敗: ${err instanceof Error ? err.message : '不明なエラー'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleGetModels = async () => {
    try {
      const response = await fetch(
        api.getModels(settings.lmstudioUrl)
      );
      const data = await response.json();
      if (data.success && data.models) {
        setAvailableModels(data.models);
      }
    } catch (err) {
      console.error('モデル取得エラー:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>⚙️ 設定</CardTitle>
        <CardDescription>
          LMStudio APIの設定を行います
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lmstudio-url">LMStudio API URL</Label>
          <Input
            id="lmstudio-url"
            type="text"
            value={settings.lmstudioUrl}
            onChange={(e) =>
              onSettingsChange({ ...settings, lmstudioUrl: e.target.value })
            }
            placeholder="http://localhost:1234/v1/chat/completions"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lmstudio-model">LMStudio モデル名</Label>
          <Input
            id="lmstudio-model"
            type="text"
            value={settings.lmstudioModel}
            onChange={(e) =>
              onSettingsChange({ ...settings, lmstudioModel: e.target.value })
            }
            placeholder="openai/gpt-oss-20b"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="auto-generate"
            checked={settings.autoGenerateMinutes}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, autoGenerateMinutes: checked === true })
            }
          />
          <Label
            htmlFor="auto-generate"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            議事録を自動生成
          </Label>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <Button
            onClick={handleTestConnection}
            disabled={isTesting}
            variant="outline"
            className="w-full"
          >
            {isTesting ? 'テスト中...' : '🔌 API接続をテスト'}
          </Button>

          <Button
            onClick={handleGetModels}
            variant="secondary"
            className="w-full"
          >
            📋 利用可能なモデルを取得
          </Button>
        </div>

        {testResult && (
          <Alert variant={testResult.success ? 'default' : 'destructive'}>
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}

        {availableModels.length > 0 && (
          <Alert>
            <AlertDescription>
              <p className="font-medium mb-2">利用可能なモデル:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {availableModels.map((model) => (
                  <li key={model}>{model}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
