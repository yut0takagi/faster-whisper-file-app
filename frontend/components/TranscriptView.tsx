'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TranscriptViewProps {
  transcript: string;
  onDownload: () => void;
}

export default function TranscriptView({ transcript, onDownload }: TranscriptViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>📝 文字起こし結果</CardTitle>
            <CardDescription>
              文字起こしが完了しました
            </CardDescription>
          </div>
          <Button onClick={onDownload} variant="outline">
            📥 Markdown をダウンロード
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={transcript}
          readOnly
          className="min-h-[300px] font-mono text-sm"
        />
      </CardContent>
    </Card>
  );
}
