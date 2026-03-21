'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  MessageSquare, 
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
  Play,
  Copy,
  Check,
  Code,
  LogOut
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

// Code Block Component with Copy Button
function CodeBlock({ 
  inline, 
  className, 
  children, 
  ...props 
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
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
    return (
      <code 
        className="bg-slate-700/50 text-pink-300 px-1.5 py-0.5 rounded-md text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800/80 px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium uppercase">
            {language || 'code'}
          </span>
        </div>
        <Button
          onClick={handleCopy}
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-slate-400 hover:text-white hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span className="text-xs text-emerald-400">Disalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">Salin</span>
            </>
          )}
        </Button>
      </div>
      {/* Code */}
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'rgba(15, 23, 42, 0.8)',
          fontSize: '0.875rem',
        }}
        showLineNumbers={true}
      >
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
      <div
        className={`max-w-[85%] sm:max-w-[80%] ${
          isUser
            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl rounded-br-md'
            : 'bg-slate-800/80 text-slate-200 rounded-2xl rounded-bl-md border border-white/5'
        }`}
      >
        {/* Avatar for assistant */}
        {!isUser && (
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs text-slate-400 font-medium">AI Assistant</span>
          </div>
        )}
        
        {/* Message Content */}
        <div className={`prose prose-sm sm:prose-base max-w-none ${
          isUser 
            ? 'px-4 py-3 prose-invert' 
            : 'px-4 pb-3 pt-1 prose-invert prose-headings:text-white prose-p:text-slate-200 prose-li:text-slate-200'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed m-0">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                code: CodeBlock as React.ComponentType<React.HTMLAttributes<HTMLElement> & { inline?: boolean; className?: string; children?: React.ReactNode }>,
                p: ({ children }) => <p className="leading-relaxed mb-3 last:mb-0">{children}</p>,
                h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-slate-200">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-violet-500 pl-4 italic text-slate-300 my-3">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline">
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                hr: () => <hr className="border-white/20 my-4" />,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full border border-white/10">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-white/10 px-3 py-2 bg-slate-700/50 text-left font-medium">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="border border-white/10 px-3 py-2">{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIContentStudio() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageSize, setImageSize] = useState('1024x1024');

  // Text-to-Speech State
  const [ttsText, setTtsText] = useState('');
  const [ttsAudio, setTtsAudio] = useState('');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsVoice, setTtsVoice] = useState('tongtong');

  // Video Generation State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoTasks, setVideoTasks] = useState<VideoTask[]>([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoQuality, setVideoQuality] = useState('speed');

  // Active tab
  const [activeTab, setActiveTab] = useState('chat');

  // Chat scroll ref
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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
        body: JSON.stringify({ 
          message: userMessage,
          history: chatMessages
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `**Error:** ${data.error || 'Failed to get response'}` 
        }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '**Maaf, terjadi kesalahan. Silakan coba lagi.**' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Image Generation Handler
  const handleImageGenerate = async () => {
    if (!imagePrompt.trim() || imageLoading) return;

    setImageLoading(true);
    setGeneratedImage('');

    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, size: imageSize }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedImage(data.image);
      } else {
        alert(`Error: ${data.error || 'Failed to generate image'}`);
      }
    } catch (error) {
      alert('Failed to generate image. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  // Text-to-Speech Handler
  const handleTTS = async () => {
    if (!ttsText.trim() || ttsLoading) return;

    setTtsLoading(true);
    setTtsAudio('');

    try {
      const response = await fetch('/api/audio/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ttsText, voice: ttsVoice }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.useBrowserTTS) {
          // Use browser's built-in TTS
          const utterance = new SpeechSynthesisUtterance(ttsText);
          utterance.lang = 'id-ID';
          utterance.rate = 1;
          utterance.pitch = 1;
          
          // Get available voices and try to find Indonesian voice
          const voices = window.speechSynthesis.getVoices();
          const idVoice = voices.find(v => v.lang.includes('id')) || voices[0];
          if (idVoice) utterance.voice = idVoice;
          
          // Set a placeholder to show TTS is ready
          setTtsAudio('browser-tts');
          
          window.speechSynthesis.speak(utterance);
        } else {
          setTtsAudio(data.audio);
        }
      } else {
        alert(`Error: ${data.error || 'Failed to synthesize speech'}`);
      }
    } catch (error) {
      alert('Failed to synthesize speech. Please try again.');
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
        body: JSON.stringify({ 
          prompt: videoPrompt, 
          quality: videoQuality, 
          duration: videoDuration 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.videoUrl) {
          // Direct video URL available
          setVideoTasks(prev => [...prev, {
            taskId: data.taskId || `video_${Date.now()}`,
            status: 'SUCCESS',
            prompt: videoPrompt,
            videoUrl: data.videoUrl
          }]);
        } else {
          // Polling needed
          setVideoTasks(prev => [...prev, {
            taskId: data.taskId,
            status: data.status,
            prompt: videoPrompt
          }]);
        }
        setVideoPrompt('');
      } else {
        alert(`Error: ${data.error || 'Failed to start video generation'}`);
      }
    } catch (error) {
      alert('Failed to start video generation. Please try again.');
    } finally {
      setVideoLoading(false);
    }
  };

  // Check Video Status
  const checkVideoStatus = async (taskId: string) => {
    try {
      const response = await fetch(`/api/video/generate?taskId=${taskId}`);
      const data = await response.json();
      
      if (data.success) {
        setVideoTasks(prev => prev.map(task => 
          task.taskId === taskId 
            ? { ...task, status: data.status, videoUrl: data.videoUrl || task.videoUrl }
            : task
        ));
      }
    } catch (error) {
      console.error('Failed to check video status:', error);
    }
  };

  // Auto-poll for processing videos
  useEffect(() => {
    const processingTasks = videoTasks.filter(t => t.status === 'PROCESSING');
    if (processingTasks.length === 0) return;

    const interval = setInterval(() => {
      processingTasks.forEach(task => checkVideoStatus(task.taskId));
    }, 10000);

    return () => clearInterval(interval);
  }, [videoTasks]);

  // Download image
  const downloadImage = (base64Image: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = filename;
    link.click();
  };

  // Clear chat
  const clearChat = () => {
    setChatMessages([]);
  };

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          <p className="text-slate-400">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl sm:rounded-2xl blur-lg opacity-50" />
                <div className="relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600">
                  <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-fuchsia-200 bg-clip-text text-transparent">
                  ITS AI
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Semua fitur AI — 100% GRATIS</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Badge variant="outline" className="hidden sm:flex gap-1.5 px-3 py-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </Badge>
              
              {/* User Menu */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-sm text-white font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400">{user?.email || ''}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="p-2 rounded-lg bg-slate-800/50 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-8 bg-slate-900/50 border border-white/5 backdrop-blur-sm h-auto p-1 sm:p-1.5 rounded-xl sm:rounded-2xl">
            <TabsTrigger 
              value="chat" 
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white rounded-lg sm:rounded-xl py-2 sm:py-3 text-slate-400 hover:text-white transition-all text-xs sm:text-sm"
            >
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">Chat AI</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="image" 
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white rounded-lg sm:rounded-xl py-2 sm:py-3 text-slate-400 hover:text-white transition-all text-xs sm:text-sm"
            >
              <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">Gambar</span>
              <span className="sm:hidden">Gambar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tts" 
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg sm:rounded-xl py-2 sm:py-3 text-slate-400 hover:text-white transition-all text-xs sm:text-sm"
            >
              <Music className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">TTS</span>
              <span className="sm:hidden">Suara</span>
            </TabsTrigger>
            <TabsTrigger 
              value="video" 
              className="flex items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg sm:rounded-xl py-2 sm:py-3 text-slate-400 hover:text-white transition-all text-xs sm:text-sm"
            >
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
                  <div>
                    <CardTitle className="text-white flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                      <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600">
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      AI Chatbot
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1 sm:mt-2 text-xs sm:text-sm">
                      Ngobrol dengan AI asisten — Support code, markdown, dan format lainnya
                    </CardDescription>
                  </div>
                  {chatMessages.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearChat}
                      className="text-slate-400 hover:text-white hover:bg-white/5 h-8 sm:h-9"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Clear</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="h-[400px] sm:h-[500px] flex flex-col">
                  {/* Chat Messages - Scrollable */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto pr-2 mb-4 space-y-4 sm:space-y-5"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20 mb-4 sm:mb-6">
                          <Bot className="w-10 h-10 sm:w-16 sm:h-16 text-violet-400" />
                        </div>
                        <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Halo! Ada yang bisa dibantu?</p>
                        <div className="text-xs sm:text-sm text-slate-500 text-center max-w-md px-4 space-y-2">
                          <p>Coba tanya sesuatu seperti:</p>
                          <div className="flex flex-wrap justify-center gap-2">
                            <Badge variant="outline" className="text-slate-400 border-slate-600">"Bantu tulis kode Python"</Badge>
                            <Badge variant="outline" className="text-slate-400 border-slate-600">"Jelaskan tentang AI"</Badge>
                            <Badge variant="outline" className="text-slate-400 border-slate-600">"Buat artikel"</Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {chatMessages.map((msg, idx) => (
                          <ChatMessageComponent key={idx} message={msg} />
                        ))}
                        {chatLoading && (
                          <div className="flex justify-start">
                            <div className="bg-slate-800/80 rounded-2xl rounded-bl-md border border-white/5 overflow-hidden">
                              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                  <Bot className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-xs text-slate-400 font-medium">AI Assistant</span>
                              </div>
                              <div className="px-4 pb-3">
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                                  <span className="text-slate-400 text-sm">Sedang berpikir...</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {/* Chat Input */}
                  <div className="flex gap-2 sm:gap-3">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChat()}
                      placeholder="Ketik pesan... (bisa pakai markdown)"
                      className="bg-slate-800/50 border-white/10 text-white placeholder-slate-500 h-10 sm:h-12 text-sm sm:text-base focus:border-violet-500 focus:ring-violet-500/20"
                    />
                    <Button 
                      onClick={handleChat} 
                      disabled={chatLoading || !chatInput.trim()} 
                      className="h-10 sm:h-12 px-4 sm:px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image Generation Tab */}
          <TabsContent value="image" className="mt-0">
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Generate Image */}
              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm shadow-2xl shadow-pink-500/5">
                <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-pink-600 to-rose-600">
                      <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    Generate Gambar
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs sm:text-sm">
                    Buat gambar dari deskripsi teks
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  <div>
                    <Label className="text-white font-medium text-sm sm:text-base">Deskripsi Gambar</Label>
                    <Textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Contoh: A beautiful sunset over mountains..."
                      className="bg-slate-800/50 border-white/10 text-white placeholder-slate-500 mt-2 min-h-[80px] sm:min-h-[100px] text-sm sm:text-base focus:border-pink-500 focus:ring-pink-500/20"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-medium text-sm sm:text-base">Ukuran</Label>
                    <select
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value)}
                      className="w-full mt-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-slate-800/50 border border-white/10 text-white text-sm sm:text-base focus:border-pink-500 focus:outline-none"
                    >
                      <option value="1024x1024">1024x1024 (Square)</option>
                      <option value="1344x768">1344x768 (Landscape)</option>
                      <option value="768x1344">768x1344 (Portrait)</option>
                      <option value="1440x720">1440x720 (Wide)</option>
                    </select>
                  </div>
                  <Button 
                    onClick={handleImageGenerate} 
                    disabled={imageLoading || !imagePrompt.trim()}
                    className="w-full h-10 sm:h-12 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg shadow-pink-500/25 text-sm sm:text-base"
                  >
                    {imageLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Generate Gambar
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Image Result */}
              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm shadow-2xl shadow-pink-500/5">
                <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                  <CardTitle className="text-white text-lg sm:text-xl">Hasil</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {generatedImage ? (
                    <div className="space-y-4">
                      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/10">
                        <img 
                          src={generatedImage} 
                          alt="Generated" 
                          className="w-full"
                        />
                      </div>
                      <Button 
                        onClick={() => downloadImage(generatedImage, 'ai-generated.png')}
                        className="w-full h-10 sm:h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 text-sm sm:text-base"
                      >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Download Gambar
                      </Button>
                    </div>
                  ) : (
                    <div className="h-48 sm:h-80 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl sm:rounded-2xl bg-slate-800/20">
                      <div className="text-center text-slate-500">
                        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-800/50 w-fit mx-auto mb-2 sm:mb-4">
                          <ImageIcon className="w-8 h-8 sm:w-12 sm:h-12" />
                        </div>
                        <p className="text-sm sm:text-base">Gambar akan muncul di sini</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TTS Tab */}
          <TabsContent value="tts" className="mt-0">
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm shadow-2xl shadow-emerald-500/5">
              <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                <CardTitle className="text-white flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600">
                    <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Text to Speech
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs sm:text-sm">
                  Ubah teks menjadi suara (maks 1024 karakter)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <Label className="text-white font-medium text-sm sm:text-base">Teks (Bahasa Indonesia)</Label>
                      <Textarea
                        value={ttsText}
                        onChange={(e) => setTtsText(e.target.value)}
                        placeholder="Ketik teks dalam Bahasa Indonesia... Contoh: Halo, apa kabar hari ini?"
                        className="bg-slate-800/50 border-white/10 text-white placeholder-slate-500 mt-2 min-h-[120px] sm:min-h-[150px] text-sm sm:text-base focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        {ttsText.length}/1024 karakter
                      </p>
                    </div>
                    <div>
                      <Label className="text-white font-medium text-sm sm:text-base">Pilih Suara</Label>
                      <select
                        value={ttsVoice}
                        onChange={(e) => setTtsVoice(e.target.value)}
                        className="w-full mt-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-slate-800/50 border border-white/10 text-white text-sm sm:text-base focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="tongtong">Tongtong - Hangat & Ramah</option>
                        <option value="chuichui">Chuichui - Ceria & Energik</option>
                        <option value="xiaochen">Xiaochen - Profesional</option>
                        <option value="kazi">Kazi - Jernih & Standard</option>
                      </select>
                    </div>
                    <Button 
                      onClick={handleTTS} 
                      disabled={ttsLoading || !ttsText.trim() || ttsText.length > 1024}
                      className="w-full h-10 sm:h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 text-sm sm:text-base"
                    >
                      {ttsLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Generate Audio
                        </>
                      )}
                    </Button>
                  </div>
                  <div>
                    {ttsAudio ? (
                      <div className="space-y-4">
                        <div className="p-4 sm:p-6 bg-slate-800/50 rounded-xl sm:rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 sm:gap-3 mb-4">
                            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/20">
                              <Music className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm sm:text-base">Audio Generated</p>
                              <p className="text-slate-400 text-xs sm:text-sm">
                                {ttsAudio === 'browser-tts' ? 'Memutar via Browser TTS' : 'Klik play untuk mendengar'}
                              </p>
                            </div>
                          </div>
                          {ttsAudio === 'browser-tts' ? (
                            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                              <p className="text-emerald-300 text-sm">🔊 Audio sedang diputar via Browser TTS...</p>
                              <p className="text-slate-400 text-xs mt-2">Tip: Pastikan speaker Anda aktif</p>
                            </div>
                          ) : (
                            <audio 
                              controls 
                              src={ttsAudio} 
                              className="w-full"
                            />
                          )}
                        </div>
                        {ttsAudio !== 'browser-tts' && (
                          <Button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = ttsAudio;
                              link.download = 'speech.wav';
                              link.click();
                            }}
                            className="w-full h-10 sm:h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg shadow-violet-500/25 text-sm sm:text-base"
                          >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Download Audio
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="h-48 sm:h-64 flex items-center justify-center border border-white/5 rounded-xl sm:rounded-2xl bg-slate-800/20">
                        <div className="text-center text-slate-500">
                          <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-800/50 w-fit mx-auto mb-2 sm:mb-4">
                            <Music className="w-8 h-8 sm:w-12 sm:h-12" />
                          </div>
                          <p className="text-sm sm:text-base">Audio akan muncul di sini</p>
                        </div>
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
              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm shadow-2xl shadow-cyan-500/5">
                <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600">
                      <Film className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    Generate Video
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs sm:text-sm">
                    Buat video dari deskripsi teks (1-5 menit)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  <div>
                    <Label className="text-white font-medium text-sm sm:text-base">Deskripsi Video</Label>
                    <Textarea
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder="Contoh: A cat playing with a ball in a sunny garden..."
                      className="bg-slate-800/50 border-white/10 text-white placeholder-slate-500 mt-2 min-h-[80px] sm:min-h-[120px] text-sm sm:text-base focus:border-cyan-500 focus:ring-cyan-500/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-white font-medium text-sm sm:text-base">Durasi</Label>
                      <select
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(Number(e.target.value))}
                        className="w-full mt-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-slate-800/50 border border-white/10 text-white text-sm sm:text-base focus:border-cyan-500 focus:outline-none"
                      >
                        <option value={5}>5 detik</option>
                        <option value={10}>10 detik</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-white font-medium text-sm sm:text-base">Kualitas</Label>
                      <select
                        value={videoQuality}
                        onChange={(e) => setVideoQuality(e.target.value)}
                        className="w-full mt-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-slate-800/50 border border-white/10 text-white text-sm sm:text-base focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="speed">Speed (Cepat)</option>
                        <option value="quality">Quality (Bagus)</option>
                      </select>
                    </div>
                  </div>
                  <Button 
                    onClick={handleVideoGenerate} 
                    disabled={videoLoading || !videoPrompt.trim()}
                    className="w-full h-10 sm:h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25 text-sm sm:text-base"
                  >
                    {videoLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Film className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Generate Video
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm shadow-2xl shadow-cyan-500/5">
                <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                  <CardTitle className="text-white text-lg sm:text-xl">Video Tasks</CardTitle>
                  <CardDescription className="text-slate-400 text-xs sm:text-sm">
                    Status pembuatan video
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {videoTasks.length === 0 ? (
                    <div className="h-48 sm:h-64 flex items-center justify-center border border-white/5 rounded-xl sm:rounded-2xl bg-slate-800/20">
                      <div className="text-center text-slate-500">
                        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-800/50 w-fit mx-auto mb-2 sm:mb-4">
                          <Film className="w-8 h-8 sm:w-12 sm:h-12" />
                        </div>
                        <p className="text-sm sm:text-base">Belum ada video task</p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="h-[280px] sm:h-[340px] space-y-2 sm:space-y-3 pr-2">
                      {videoTasks.map((task) => (
                        <div key={task.taskId} className="p-3 sm:p-4 bg-slate-800/50 rounded-xl sm:rounded-2xl border border-white/5">
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <span className="text-[10px] sm:text-xs text-slate-500 font-mono truncate max-w-[120px] sm:max-w-[200px]">{task.taskId}</span>
                            <Badge variant={
                              task.status === 'SUCCESS' ? 'default' : 
                              task.status === 'FAIL' ? 'destructive' : 'secondary'
                            } className={`text-[10px] sm:text-xs ${
                              task.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                              task.status === 'PROCESSING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                              'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {task.status === 'SUCCESS' ? '✓ Selesai' : 
                               task.status === 'PROCESSING' ? '⏳ Processing' : '✗ Gagal'}
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{task.prompt}</p>
                          <div className="flex gap-2">
                            {task.status === 'PROCESSING' && (
                              <Button 
                                size="sm" 
                                onClick={() => checkVideoStatus(task.taskId)}
                                variant="outline"
                                className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 h-7 sm:h-8 text-[10px] sm:text-xs"
                              >
                                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                                Check
                              </Button>
                            )}
                            {task.status === 'SUCCESS' && task.videoUrl && (
                              <a 
                                href={task.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-[10px] sm:text-sm font-medium hover:bg-cyan-500/30 transition-colors"
                              >
                                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                                Lihat Video
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer - Sticky at bottom */}
      <footer className="sticky mt-auto border-t border-white/5 bg-slate-950/90 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
                <span>Powered by </span>
                <a href="https://itsacademics.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 font-medium">
                  PT ITS Academic Technology
                </a>
              </span>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] sm:text-xs">
              100% GRATIS
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}
