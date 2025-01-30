import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VerificationBanner() {
  const { user, sendVerificationEmail, checkEmailVerification } = useAuth();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (user && !user.emailVerified) {
      const interval = setInterval(() => {
        checkEmailVerification();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, checkEmailVerification]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendDisabled && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setResendDisabled(false);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendDisabled]);

  const handleResend = async () => {
    try {
      await sendVerificationEmail();
      setResendDisabled(true);
    } catch (error) {
      console.error('Failed to resend:', error);
    }
  };

  // Don't render anything if no user or email is verified
  if (!user || user.emailVerified) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Alert className="bg-yellow-500/10 border-yellow-500/20 m-4">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-yellow-500" />
            <AlertDescription className="ml-3 text-yellow-500">
              Please verify your email address to access all features.
            </AlertDescription>
          </div>
          {resendDisabled ? (
            <div className="flex items-center text-yellow-500">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              <span>Resend in {countdown}s</span>
            </div>
          ) : (
            <button
              onClick={handleResend}
              className="text-yellow-500 hover:text-yellow-400 font-medium"
            >
              Resend verification email
            </button>
          )}
        </div>
      </Alert>
    </div>
  );
}