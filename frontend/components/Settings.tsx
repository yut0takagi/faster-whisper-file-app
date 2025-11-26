'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings as SettingsIcon, Plug, List, Loader2, CheckCircle2, XCircle, Sparkles, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        setTestResult({ success: true, message: 'Connected successfully' });
      } else {
        setTestResult({ success: false, message: `Error: ${data.detail}` });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
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
      console.error('Model fetch error:', err);
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg text-white">Configuration</CardTitle>
            <CardDescription className="text-white/50">LMStudio Connection</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="lmstudio-url" className="text-white/80 text-xs uppercase tracking-wider font-semibold ml-1">API URL</Label>
          <div className="relative">
            <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              id="lmstudio-url"
              type="text"
              value={settings.lmstudioUrl}
              onChange={(e) =>
                onSettingsChange({ ...settings, lmstudioUrl: e.target.value })
              }
              placeholder="http://localhost:1234..."
              className="pl-9 bg-black/30 border-white/10 text-white placeholder:text-white/20 h-10 focus:ring-purple-500/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lmstudio-model" className="text-white/80 text-xs uppercase tracking-wider font-semibold ml-1">Model Name</Label>
          <div className="relative">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              id="lmstudio-model"
              type="text"
              value={settings.lmstudioModel}
              onChange={(e) =>
                onSettingsChange({ ...settings, lmstudioModel: e.target.value })
              }
              placeholder="openai/gpt-oss-20b"
              className="pl-9 bg-black/30 border-white/10 text-white placeholder:text-white/20 h-10 focus:ring-purple-500/50"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <Checkbox
            id="auto-generate"
            checked={settings.autoGenerateMinutes}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, autoGenerateMinutes: checked === true })
            }
            className="border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
          />
          <Label
            htmlFor="auto-generate"
            className="text-sm font-medium leading-none cursor-pointer text-white/80"
          >
            Auto-generate Minutes
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            onClick={handleTestConnection}
            disabled={isTesting}
            variant="outline"
            className="w-full h-9 bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white"
          >
            {isTesting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plug className="w-4 h-4 mr-2" />
                Test
              </>
            )}
          </Button>

          <Button
            onClick={handleGetModels}
            variant="outline"
            className="w-full h-9 bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white"
          >
            <List className="w-4 h-4 mr-2" />
            Models
          </Button>
        </div>

        {testResult && (
          <Alert 
            className={cn(
              "border text-xs py-2",
              testResult.success 
                ? "bg-green-500/10 border-green-500/20 text-green-200" 
                : "bg-red-500/10 border-red-500/20 text-red-200"
            )}
          >
            <AlertDescription className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}

        {availableModels.length > 0 && (
          <div className="mt-2 p-3 rounded-lg bg-black/30 border border-white/10 max-h-40 overflow-y-auto">
            <p className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">Available Models</p>
            <ul className="space-y-1">
              {availableModels.map((model) => (
                <li key={model} className="text-xs text-cyan-300 font-mono truncate">
                  {model}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
