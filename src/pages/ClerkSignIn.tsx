// Clerk Sign-In Page — restyled to the DeutschUp design language.
// Google One Tap mounted above the card: signed-out returning Google users
// get a one-click prompt; the SignIn card is the fallback for everyone else.
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SignIn } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/authStore';
import { clerkAppearance } from '../lib/clerk/appearance';
import { AuthPage, AuthLoader } from './AuthShell';

export default function ClerkSignIn() {
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <AuthLoader />;
  }

  return (
    <AuthPage
      eyebrow="Selamat Datang Kembali"
      title="Masuk ke DeutschUp"
      subtitle="Lanjutkan perjalanan Bahasa Jermanmu."
    >
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        appearance={clerkAppearance}
      />
    </AuthPage>
  );
}
