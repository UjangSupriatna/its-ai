'use client';

import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Image as ImageIcon, 
  Volume2, 
  Video, 
  Sparkles, 
  Send, 
  Loader2, 
  Download,
  Wand2,
  Palette,
  Music,
  Film,
  Bot,
  Trash2,
  Copy,
  Check,
  Code,
} from 'lucide-react';

// Types
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface VideoTask {
  taskId: string;
  status: string;
  prompt: string;
  videoUrl?: string;
}

// Code Block Component
function CodeBlock({ inline, className, children }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return <code className="bg-slate-700/50 text-pink-300 px-1.5 py-0.5 rounded-md text-sm font-mono">{children}</code>;
  }

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between bg-slate-800/80 px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium uppercase">{language || 'code'}</span>
        </div>
        <Button onClick={handleCopy} size="sm" variant="ghost" className="h-7 px-2 text-slate-400 hover:text-white hover:bg-white/10">
          {copied ? <><Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /><span className="text-xs text-emerald-400">Disalin!</span></> : <><Copy className="w-3.5 h-3.5 mr-1" /><span className="text-xs">Salin</span></>}
        </Button>
      </div>
      <SyntaxHighlighter language={language || 'text'} style={oneDark} customStyle={{ margin: 0, padding: '1rem', background: 'rgba(15, 23, 42, 0.8)', fontSize: '0.875rem' }} showLineNumbers>
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

// Chat Message Component
function ChatMessageComponent({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[80%] ${isUser ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl rounded-br-md' : 'bg-slate-800/80 text-slate-200 rounded-2xl rounded-bl-md border border-white/5'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs text-slate-400 font-medium">AI Assistant</span>
          </div>
        )}
        <div className={`prose prose-sm sm:prose-base max-w-none ${isUser ? 'px-4 py-3 prose-invert' : 'px-4 pb-3 pt-1 prose-invert prose-headings:text-white prose-p:text-slate-200 prose-li:text-slate-200'}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed m-0">{message.content}</p>
          ) : (
            <ReactMarkdown components={{ code: CodeBlock as React.ComponentType<React.HTMLAttributes<HTMLElement> & { inline?: boolean; className?: string; children?: React.ReactNode }> }}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIContentStudio() {
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Text-to-Speech State
  const [ttsText, setTtsText] = useState('');
  const [ttsAudio, setTtsAudio] = useState('');
  const [ttsLoading, setTtsLoading] = useState(false);

  // Video Generation State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoTasks, setVideoTasks] = useState<VideoTask[]>([]);
  const [videoLoading, setVideoLoading] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState('chat');

  // Chat scroll ref
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Chat Handler
  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: chatMessages }),
      });

      const data = await response.json();
      
      if (data.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${data.error || 'Failed to get response'}` }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '**Maaf, terjadi kesalahan. Silakan coba lagi.**' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Image Generation Handler
  const handleImageGenerate = async () => {
    if (!imagePrompt.trim() || imageLoading) return;

    setImageLoading(true);
    setGeneratedImage('');
    setImageLoaded(false);

    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedImage(data.image);
      } else {
        alert(`Error: ${data.error || 'Failed to generate image'}`);
      }
    } catch {
      alert('Failed to generate image. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  // TTS Handler
  const handleTTS = async () => {
    if (!ttsText.trim() || ttsLoading) return;

    setTtsLoading(true);
    setTtsAudio('');

    try {
      const response = await fetch('/api/audio/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ttsText }),
      });

      const data = await response.json();
      
      if (data.success && data.useBrowserTTS) {
        const utterance = new SpeechSynthesisUtterance(ttsText);
        utterance.lang = 'id-ID';
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(v => v.lang.includes('id')) || voices[0];
        if (idVoice) utterance.voice = idVoice;
        setTtsAudio('browser-tts');
        window.speechSynthesis.speak(utterance);
      } else {
        alert(`Error: ${data.error || 'Failed'}`);
      }
    } catch {
      alert('Failed. Please try again.');
    } finally {
      setTtsLoading(false);
    }
  };

  // Video Generation Handler
  const handleVideoGenerate = async () => {
    if (!videoPrompt.trim() || videoLoading) return;

    setVideoLoading(true);

    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: videoPrompt }),
      });

      const data = await response.json();
      
      if (data.success) {
        setVideoTasks(prev => [...prev, {
          taskId: data.taskId || `video_${Date.now()}`,
          status: 'SUCCESS',
          prompt: videoPrompt,
          videoUrl: data.videoUrl
        }]);
        setVideoPrompt('');
      } else {
        alert(`Error: ${data.error || 'Failed to generate video'}`);
      }
    } catch {
      alert('Failed to generate video. Please try again.');
    } finally {
      setVideoLoading(false);
    }
  };

  // Download image
  const downloadImage = async (imageSrc: string, filename: string) => {
    try {
      if (imageSrc.startsWith('http')) {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = filename;
        link.click();
      }
    } catch {
      window.open(imageSrc, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl sm:rounded-2xl blur-lg opacity-50" />
              <div className="relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600">
                <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-fuchsia-200 bg-clip-text text-transparent">ITS AI</h1>
              <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Semua fitur AI — 100% GRATIS</p>
            </div>
            <Badge variant="outline" className="ml-auto gap-1.5 px-3 py-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-8 bg-slate-900/50 border border-white/5 backdrop-blur-sm h-auto p-1 sm:p-1.5 rounded-xl sm:rounded-2xl">
            <TabsTrigger value="chat" className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white rounded-lg sm:rounded-xl py-2 sm:py-3 text-slate-400 hover:text-white transition-all text-xs sm:text-sm">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">Chat AI</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white rounded-lg sm:rounded-xl py-2 sm:py-3 text-slate-400 hover:text-white transition-all text-xs sm:text-sm">
              <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">Gambar</span>
              <span className="sm:hidden">Gambar</span>
            </TabsTrigger>
            <TabsTrigger value="tts" className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg sm:rounded-xl py-2 sm:py-3 text-slate-400 hover:text-white transition-all text-xs sm:text-sm">
              <Music className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">TTS</span>
              <span className="sm:hidden">Suara</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg sm:rounded-xl py-2 sm:py-3 text-slate-400 hover:text-white transition-all text-xs sm:text-sm">
              <Film className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">Video</span>
              <span className="sm:hidden">Video</span>
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-0">
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm shadow-2xl shadow-purple-500/5">
              <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    AI Chatbot
                  </CardTitle>
                  {chatMessages.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setChatMessages([])} className="text-slate-400 hover:text-white hover:bg-white/5 h-8 sm:h-9">
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Clear</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="h-[400px] sm:h-[500px] flex flex-col">
                  <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-2 mb-4 space-y-4 sm:space-y-5" style={{ scrollBehavior: 'smooth' }}>
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20 mb-4 sm:mb-6">
                          <Bot className="w-10 h-10 sm:w-16 sm:h-16 text-violet-400" />
                        </div>
                        <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Halo! Ada yang bisa dibantu?</p>
                        <div className="text-xs sm:text-sm text-slate-500 text-center max-w-md px-4">
                          <p>Coba tanya sesuatu...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {chatMessages.map((msg, idx) => <ChatMessageComponent key={idx} message={msg} />)}
                        {chatLoading && (
                          <div className="flex justify-start">
                            <div className="bg-slate-800/80 rounded-2xl rounded-bl-md border border-white/5 p-4">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                                <span className="text-slate-400 text-sm">Sedang berpikir...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChat()} placeholder="Ketik pesan..." className="bg-slate-800/50 border-white/10 text-white placeholder-slate-500 h-10 sm:h-12 text-sm sm:text-base" />
                    <Button onClick={handleChat} disabled={chatLoading || !chatInput.trim()} className="h-10 sm:h-12 px-4 sm:px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white">
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image Tab */}
          <TabsContent value="image" className="mt-0">
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-pink-600 to-rose-600">
                      <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    Generate Gambar
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div>
                    <Label className="text-white font-medium">Deskripsi Gambar</Label>
                    <Textarea value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} placeholder="Contoh: A beautiful sunset over mountains..." className="bg-slate-800/50 border-white/10 text-white placeholder-slate-500 mt-2 min-h-[100px]" />
                  </div>
                  <Button onClick={handleImageGenerate} disabled={imageLoading || !imagePrompt.trim()} className="w-full h-10 sm:h-12 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white">
                    {imageLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Wand2 className="w-4 h-4 mr-2" />Generate Gambar</>}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                  <CardTitle className="text-white text-lg sm:text-xl">Hasil</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {generatedImage ? (
                    <div className="space-y-4">
                      <div className="relative rounded-xl overflow-hidden border border-white/10">
                        {!imageLoaded && <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 z-10"><Loader2 className="w-8 h-8 text-pink-400 animate-spin" /></div>}
                        <img src={generatedImage} alt="Generated" className="w-full" onLoad={() => setImageLoaded(true)} />
                      </div>
                      <Button onClick={() => downloadImage(generatedImage, 'ai-generated.png')} disabled={!imageLoaded} className="w-full h-10 sm:h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                        <Download className="w-4 h-4 mr-2" />Download Gambar
                      </Button>
                    </div>
                  ) : (
                    <div className="h-48 sm:h-80 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-slate-800/20">
                      <div className="text-center text-slate-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4" />
                        <p>Gambar akan muncul di sini</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TTS Tab */}
          <TabsContent value="tts" className="mt-0">
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
              <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                <CardTitle className="text-white flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600">
                    <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Text to Speech
                </CardTitle>
                <CardDescription className="text-slate-400">Ubah teks menjadi suara (maks 1024 karakter)</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white font-medium">Teks</Label>
                      <Textarea value={ttsText} onChange={(e) => setTtsText(e.target.value)} placeholder="Ketik teks..." className="bg-slate-800/50 border-white/10 text-white placeholder-slate-500 mt-2 min-h-[150px]" />
                      <p className="text-xs text-slate-500 mt-2">{ttsText.length}/1024 karakter</p>
                    </div>
                    <Button onClick={handleTTS} disabled={ttsLoading || !ttsText.trim() || ttsText.length > 1024} className="w-full h-10 sm:h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                      {ttsLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Volume2 className="w-4 h-4 mr-2" />Generate Audio</>}
                    </Button>
                  </div>
                  <div>
                    {ttsAudio ? (
                      <div className="p-6 bg-slate-800/50 rounded-xl border border-white/5">
                        <p className="text-emerald-300">🔊 Audio sedang diputar via Browser TTS...</p>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl">
                        <p className="text-slate-500">Audio akan muncul di sini</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video" className="mt-0">
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600">
                      <Film className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    Generate Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div>
                    <Label className="text-white font-medium">Deskripsi Video</Label>
                    <Textarea value={videoPrompt} onChange={(e) => setVideoPrompt(e.target.value)} placeholder="Contoh: A cat playing in the garden..." className="bg-slate-800/50 border-white/10 text-white placeholder-slate-500 mt-2 min-h-[100px]" />
                  </div>
                  <Button onClick={handleVideoGenerate} disabled={videoLoading || !videoPrompt.trim()} className="w-full h-10 sm:h-12 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
                    {videoLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Film className="w-4 h-4 mr-2" />Generate Video</>}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                  <CardTitle className="text-white text-lg sm:text-xl">Hasil</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {videoTasks.length > 0 ? (
                    <div className="space-y-4">
                      {videoTasks.map((task, idx) => (
                        <div key={idx} className="rounded-xl overflow-hidden border border-white/10">
                          <img src={task.videoUrl} alt="Video frame" className="w-full" />
                          <div className="p-3 bg-slate-800/50">
                            <p className="text-slate-400 text-sm truncate">{task.prompt}</p>
                            <Button onClick={() => downloadImage(task.videoUrl!, 'video-frame.jpg')} size="sm" className="mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                              <Download className="w-3 h-3 mr-1" />Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-48 sm:h-80 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-slate-800/20">
                      <div className="text-center text-slate-500">
                        <Film className="w-12 h-12 mx-auto mb-4" />
                        <p>Video akan muncul di sini</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
