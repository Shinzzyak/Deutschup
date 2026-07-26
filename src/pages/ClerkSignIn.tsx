// Clerk Sign-In Page
// Handles authentication via Clerk for canary users

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SignIn } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/authStore';
import { Loader2 } from 'lucide-react';

export default function ClerkSignIn() {
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {/* text-[#0a0a0a]/40 composites to #9d9d9d on the white bg-background:
            2.71:1, under the 3:1 floor for a graphic that carries meaning.
            brand-rust is 8.89:1 on the same surface. */}
        <Loader2 className="w-8 h-8 animate-spin text-brand-rust" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Masuk ke DeutschUp</h1>
          <p className="text-muted-foreground mt-2">
            Gunakan akun Clerk Anda untuk masuk
          </p>
        </div>
        
        <SignIn 
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: '',
            }
          }}
        />
      </div>
    </div>
  );
}