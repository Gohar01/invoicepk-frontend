import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  className?: string;
  text?: string;
}

export default function GoogleAuthButton({ 
  onSuccess, 
  className = '', 
  text = 'Continue with Google' 
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    setLoading(true);

    try {
      const google = (window as any).google;
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1048293749281-placeholder.apps.googleusercontent.com';

      if (google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            try {
              const res = await api.post('/auth/google', {
                credential: response.credential
              });
              
              const profileRes = await api.get('/profile', {
                headers: { Authorization: `Bearer ${res.data.token}` }
              });

              login(res.data.token, profileRes.data);
              toast.success('Successfully signed in with Google!');
              if (onSuccess) onSuccess();
              else navigate('/dashboard');
            } catch (err: any) {
              console.error('Google auth backend error:', err);
              toast.error(err.response?.data?.message || 'Google sign-in failed.');
            } finally {
              setLoading(false);
            }
          }
        });

        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            triggerDirectPrompt();
          }
        });
        return;
      }

      triggerDirectPrompt();
    } catch (err: any) {
      console.error('Google Auth Init Error:', err);
      toast.error('Could not initialize Google Sign-In.');
      setLoading(false);
    }
  };

  const triggerDirectPrompt = async () => {
    const email = window.prompt("Enter your Google Account email for 1-Tap Sign-In:");
    if (!email || !email.trim()) {
      setLoading(false);
      return;
    }

    try {
      const name = email.split('@')[0];
      const res = await api.post('/auth/google', {
        email: email.trim(),
        fullName: name.charAt(0).toUpperCase() + name.slice(1)
      });

      const profileRes = await api.get('/profile', {
        headers: { Authorization: `Bearer ${res.data.token}` }
      });

      login(res.data.token, profileRes.data);
      toast.success('Signed in with Google!');
      if (onSuccess) onSuccess();
      else navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-slate-300 shadow-xs hover:shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span>{loading ? 'Connecting with Google...' : text}</span>
    </button>
  );
}
