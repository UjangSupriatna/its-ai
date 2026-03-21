'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error from Google
        const error = searchParams.get('error');
        if (error) {
          setStatus('error');
          setErrorMessage(searchParams.get('error_description') || error);
          return;
        }

        // Get authorization code from Google
        const code = searchParams.get('code');
        
        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code received');
          return;
        }

        // Exchange code for tokens via our API
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to authenticate');
        }

        // Create user object from Google response
        const user = {
          id: data.user.id || data.user.sub,
          google_id: data.user.id || data.user.sub,
          name: data.user.name,
          email: data.user.email,
          image: data.user.picture,
          password: '',
          role_id: 3,
          is_active: 1,
          date_created: new Date().toISOString(),
          profile_picture: data.user.picture || '',
          google_token: data.access_token || '',
          is_google_user: 1,
          image_generated: '',
          no_handphone: '',
        };

        // Login user
        login(user, data.access_token || data.id_token);
        setStatus('success');
        
        setTimeout(() => {
          router.push('/');
        }, 1500);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 p-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="text-center relative z-10">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-violet-400 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Memproses Login...</h1>
            <p className="text-slate-400">Mohon tunggu sebentar</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Login Berhasil!</h1>
            <p className="text-slate-400">Mengalihkan ke dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Login Gagal</h1>
            <p className="text-slate-400 mb-4">{errorMessage}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              Kembali ke Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-violet-400 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Memproses Login...</h1>
          <p className="text-slate-400">Mohon tunggu sebentar</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
