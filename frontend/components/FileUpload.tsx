'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileAudio, Loader2, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onTranscriptGenerated: (transcript: string) => void;
}

export default function FileUpload({ onTranscriptGenerated }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelSize, setModelSize] = useState('base');
  const [error, setError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
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

      // Mock progress for UX (FastAPI doesn't support progress callback easily with fetch)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch(api.transcribe, {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '文字起こしに失敗しました');
      }

      const data = await response.json();
      setProgress(100);
      // Wait a bit to show 100%
      setTimeout(() => {
        onTranscriptGenerated(data.transcript);
        setIsUploading(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setIsUploading(false);
    }
  };

  return (
    <Card className="glass-card border-0 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      
      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-white font-semibold">Upload Audio</CardTitle>
              <CardDescription className="text-white/50">Supported: wav, mp3, m4a, aac, flac</CardDescription>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span>Fast Mode</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            <Label className="text-white/80 font-medium ml-1">Model Size</Label>
            <Select value={modelSize} onValueChange={setModelSize} disabled={isUploading}>
              <SelectTrigger className="bg-black/30 border-white/10 text-white h-12 focus:ring-cyan-500/50">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border-white/10 text-white">
                <SelectItem value="tiny" className="focus:bg-white/10 focus:text-white">Tiny (Fastest)</SelectItem>
                <SelectItem value="base" className="focus:bg-white/10 focus:text-white">Base (Recommended)</SelectItem>
                <SelectItem value="small" className="focus:bg-white/10 focus:text-white">Small (Balanced)</SelectItem>
                <SelectItem value="medium" className="focus:bg-white/10 focus:text-white">Medium (Precise)</SelectItem>
                <SelectItem value="large" className="focus:bg-white/10 focus:text-white">Large (Ultimate)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label className="text-white/80 font-medium ml-1">File Drop Zone</Label>
            <div 
              className={cn(
                "relative border-2 border-dashed rounded-xl transition-all duration-300 h-32 flex flex-col items-center justify-center cursor-pointer overflow-hidden",
                isDragOver 
                  ? "border-cyan-400 bg-cyan-400/10 scale-[1.02]" 
                  : "border-white/10 bg-black/20 hover:bg-black/30 hover:border-white/20"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Input
                type="file"
                accept=".wav,.mp3,.m4a,.aac,.flac,.ogg"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-4 z-10 px-6"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <FileAudio className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium truncate max-w-[200px]">{file.name}</p>
                      <p className="text-white/50 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center z-10 space-y-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5 text-white/60" />
                    </div>
                    <p className="text-white/60 text-sm">Drag & drop or click to upload</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-500/20 text-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                Transcribing...
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-white/10" /> {/* Need to style indicator in globals or component */}
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full h-12 text-base font-medium bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-500/20 transition-all duration-300 rounded-xl"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Audio...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Start Transcription
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
