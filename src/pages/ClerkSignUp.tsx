// Clerk Sign-Up Page — restyled to the DeutschUp design language.
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SignUp } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/authStore';
import { clerkAppearance } from '../lib/clerk/appearance';
import { AuthPage, AuthLoader } from './AuthShell';

export default function ClerkSignUp() {
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
      eyebrow="Mulai Sekarang"
      title="Daftar ke DeutschUp"
      subtitle="Satu akun untuk semua materi A1 sampai B1."
    >
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/"
        appearance={clerkAppearance}
      />
    </AuthPage>
  );
}
