'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, getRedirectUri } from '@/lib/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

// Get client ID from environment
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Check if client ID is configured
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Client ID belum dikonfigurasi. Silakan tambahkan NEXT_PUBLIC_GOOGLE_CLIENT_ID di Environment Variables.');
    }
  }, []);

  // Google OAuth Login - Direct to Google
  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Client ID tidak ditemukan!');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    const redirectUri = getRedirectUri();
    
    // Build Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'email profile');
    
    // Redirect to Google
    window.location.href = googleAuthUrl.toString();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 p-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <Card className="w-full max-w-md bg-slate-900/50 border-white/5 backdrop-blur-sm shadow-2xl shadow-purple-500/10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl blur-lg opacity-50" />
              <div className="relative p-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-fuchsia-200 bg-clip-text text-transparent">
            ITS AI
          </CardTitle>
          <CardDescription className="text-slate-400 mt-2">
            Login untuk mengakses semua fitur AI
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-medium">Konfigurasi Error</p>
                <p className="text-red-300/80 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Google Login Button */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading || !GOOGLE_CLIENT_ID}
            className="w-full h-14 bg-white hover:bg-slate-100 text-slate-900 font-medium text-lg shadow-lg rounded-xl transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Login dengan Google
          </Button>

          {/* Info */}
          <div className="text-center pt-4">
            <p className="text-xs text-slate-500">
              Dengan login, Anda menyetujui{' '}
              <a href="#" className="text-violet-400 hover:text-violet-300">
                Syarat & Ketentuan
              </a>{' '}
              dan{' '}
              <a href="#" className="text-violet-400 hover:text-violet-300">
                Kebijakan Privasi
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-xs text-slate-500">
              Powered by{' '}
              <a 
                href="https://itsacademics.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                PT ITS Academic Technology
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
