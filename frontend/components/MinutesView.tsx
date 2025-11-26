'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileCheck, Sparkles, Download, Loader2, Copy, Check, Bot } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);

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
        throw new Error(errorData.detail?.error || errorData.detail || 'Generation failed');
      }

      const data = await response.json();
      onMinutesGenerated(data.minutes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      onMinutesGenerated(`Error: ${errorMessage}`);
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

  const handleCopy = () => {
    navigator.clipboard.writeText(minutes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-4 border-b border-white/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <CardTitle className="text-xl text-white">AI Minutes</CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {!settings.autoGenerateMinutes && !minutes && (
              <Button
                onClick={handleGenerateMinutes}
                disabled={isGenerating}
                className="bg-white text-black hover:bg-white/90 font-medium rounded-lg"
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Now
                  </>
                )}
              </Button>
            )}
            {minutes && (
              <>
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
                  onClick={handleDownload} 
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white border-0"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 text-white/60 space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
              <Bot className="absolute inset-0 m-auto w-6 h-6 text-amber-500" />
            </div>
            <p className="animate-pulse font-medium">Analyzing and summarizing...</p>
          </div>
        )}

        {minutes && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
            <Textarea
              value={minutes}
              readOnly
              className="relative min-h-[400px] font-mono text-sm bg-black/40 border-white/10 text-white/90 focus-visible:ring-amber-500/50 resize-none leading-relaxed p-4 rounded-lg"
            />
          </div>
        )}
        
        {!isGenerating && !minutes && !settings.autoGenerateMinutes && (
          <div className="text-center py-12 text-white/40 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Ready to generate meeting minutes from transcript.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
