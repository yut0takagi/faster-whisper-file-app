'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import Settings from '@/components/Settings';
import TranscriptView from '@/components/TranscriptView';
import MinutesView from '@/components/MinutesView';

export default function Home() {
  const [transcript, setTranscript] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('');
  const [isGeneratingMinutes, setIsGeneratingMinutes] = useState(false);
  const [settings, setSettings] = useState({
    lmstudioUrl: 'http://localhost:1234/v1/chat/completions',
    lmstudioModel: 'openai/gpt-oss-20b',
    autoGenerateMinutes: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            🎧 Faster-Whisper Transcriber
          </h1>
          <p className="text-muted-foreground">
            音声ファイルをアップロードして、文字起こしと議事録生成を行います
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* サイドバー */}
          <aside className="lg:col-span-1">
            <Settings
              settings={settings}
              onSettingsChange={setSettings}
            />
          </aside>

          {/* メインコンテンツ */}
          <main className="lg:col-span-2 space-y-6">
            <FileUpload
              onTranscriptGenerated={setTranscript}
            />

            {transcript && (
              <TranscriptView
                transcript={transcript}
                onDownload={() => {
                  const blob = new Blob([transcript], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `transcript_${Date.now()}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              />
            )}

            {transcript && (
              <MinutesView
                transcript={transcript}
                settings={settings}
                minutes={minutes}
                onMinutesGenerated={setMinutes}
                isGenerating={isGeneratingMinutes}
                onGeneratingChange={setIsGeneratingMinutes}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
