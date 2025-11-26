'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MinutesViewProps {
  transcript: string;
  settings: {
    lmstudioUrl: string;
    lmstudioModel: string;
    autoGenerateMinutes: boolean;
  };
  minutes: string;
  onMinutesGenerated: (minutes: string) => void;
  isGenerating: boolean;
  onGeneratingChange: (isGenerating: boolean) => void;
}

export default function MinutesView({
  transcript,
  settings,
  minutes,
  onMinutesGenerated,
  isGenerating,
  onGeneratingChange,
}: MinutesViewProps) {
  useEffect(() => {
    if (settings.autoGenerateMinutes && transcript && !minutes && !isGenerating) {
      handleGenerateMinutes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.autoGenerateMinutes, transcript]);

  const handleGenerateMinutes = async () => {
    onGeneratingChange(true);

    try {
      const response = await fetch(api.generateMinutes, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          api_url: settings.lmstudioUrl,
          model_name: settings.lmstudioModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail?.error || errorData.detail || '議事録生成に失敗しました');
      }

      const data = await response.json();
      onMinutesGenerated(data.minutes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
      onMinutesGenerated(`❌ エラー: ${errorMessage}`);
    } finally {
      onGeneratingChange(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([minutes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minutes_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>📋 議事録生成</CardTitle>
            <CardDescription>
              LMStudio APIを使って議事録を生成します
            </CardDescription>
          </div>
          {!settings.autoGenerateMinutes && (
            <Button
              onClick={handleGenerateMinutes}
              disabled={isGenerating}
              variant="outline"
            >
              {isGenerating ? '生成中...' : '🔍 議事録を生成'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isGenerating && (
          <Alert>
            <AlertDescription>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>議事録を生成中...</span>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {minutes && (
          <>
            <Textarea
              value={minutes}
              readOnly
              className="min-h-[400px] font-mono text-sm"
            />
            <Button
              onClick={handleDownload}
              className="w-full"
              variant="outline"
            >
              📥 議事録をダウンロード
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
