'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface TranscriptViewProps {
  transcript: string;
  onDownload: () => void;
}

export default function TranscriptView({ transcript, onDownload }: TranscriptViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-4 border-b border-white/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <CardTitle className="text-xl text-white">Transcription</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleCopy}
              variant="ghost" 
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button 
              onClick={onDownload} 
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white border-0"
            >
              <Download className="w-4 h-4 mr-2" />
              Download MD
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
          <Textarea
            value={transcript}
            readOnly
            className="relative min-h-[300px] font-mono text-sm bg-black/40 border-white/10 text-white/90 focus-visible:ring-emerald-500/50 resize-none leading-relaxed p-4 rounded-lg"
          />
          <div className="absolute bottom-3 right-3 text-xs font-mono text-white/30 bg-black/40 px-2 py-1 rounded border border-white/5">
            {transcript.split('\n').length} lines • {transcript.length} chars
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
