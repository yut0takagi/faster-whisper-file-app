'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import FileUpload from '@/components/FileUpload';
import Settings from '@/components/Settings';
import TranscriptView from '@/components/TranscriptView';
import MinutesView from '@/components/MinutesView';
import { Mic, Sparkles, Waves } from 'lucide-react';

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
    <div className="min-h-screen text-white selection:bg-purple-500/30">
      {/* Background Elements */}
      <div className="aurora-bg">
        <div className="aurora-orb orb-1"></div>
        <div className="aurora-orb orb-2"></div>
        <div className="aurora-orb orb-3"></div>
      </div>
      <div className="noise-overlay"></div>

      <div className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center relative"
        >
          <div className="inline-flex items-center justify-center mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
            <div className="relative w-20 h-20 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
              <Mic className="w-10 h-10 text-cyan-400" />
            </div>
            <div className="absolute -right-2 -top-2">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-purple-400" />
              </motion.div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/60 drop-shadow-sm">
            Faster-Whisper
            <span className="block text-2xl md:text-3xl font-light mt-2 text-white/60">AI Transcription Studio</span>
          </h1>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            <span className="text-cyan-400">Supercharge</span> your audio workflow. Upload, transcribe, and generate minutes instantly with local AI power.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Settings */}
          <motion.aside 
            className="lg:col-span-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="sticky top-8 space-y-6">
              <Settings
                settings={settings}
                onSettingsChange={setSettings}
              />
              
              {/* Decorational Element */}
              <div className="glass-card p-6 rounded-xl overflow-hidden relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>
                <div className="flex items-center gap-3 text-white/80 mb-2">
                  <Waves className="w-5 h-5 text-cyan-400" />
                  <span className="font-medium">Pro Tip</span>
                </div>
                <p className="text-sm text-white/50">
                  GPU acceleration is enabled automatically when available for 3x faster processing.
                </p>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <main className="lg:col-span-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <FileUpload
                onTranscriptGenerated={setTranscript}
              />
            </motion.div>

            {transcript && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
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
              </motion.div>
            )}

            {transcript && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <MinutesView
                  transcript={transcript}
                  settings={settings}
                  minutes={minutes}
                  onMinutesGenerated={setMinutes}
                  isGenerating={isGeneratingMinutes}
                  onGeneratingChange={setIsGeneratingMinutes}
                />
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
