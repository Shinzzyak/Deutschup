import { Link } from 'react-router';
import { Button } from './ui/button';
import Magnetic from './ui/magnetic';
import Hero from './Hero';
import ProductShowcase from './ProductShowcase';
import LearningRoadmap from './LearningRoadmap';
import SocialProof from './SocialProof';
import CTASection from './CTASection';
import { motion } from 'motion/react';
import { GoogleOneTap } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/authStore';
import { isClerkEnabled } from '../lib/clerk/config';
import { clerkAppearance } from '../lib/clerk/appearance';

// Google One Tap for signed-out landing visitors — one-click sign-in/sign-up
// without leaving the page. Guarded so dev (no Clerk key) never crashes.
function OneTapGuest() {
  const { user } = useAuthStore();
  if (!isClerkEnabled() || user) return null;
  return (
    <GoogleOneTap
      appearance={clerkAppearance}
      cancelOnTapOutside
      itpSupport
    />
  );
}

function Header() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full glass-nav sticky top-0 z-50"
    >
      <nav className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-4 flex items-center justify-between" aria-label="Navigasi utama">
        <Link to="/" className="flex items-center space-x-3">
          {/* German flag — small, precise */}
          <div className="flex flex-col w-2.5 h-5" aria-hidden="true">
            <div className="flex-1 bg-brand-ink" />
            <div className="flex-1 bg-brand-rust" />
            <div className="flex-1 bg-brand-tan" />
          </div>
          <span className="font-serif text-xl font-bold text-brand-ink tracking-tight">DeutschUp</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/sign-in" className="flex items-center min-h-11 px-2 text-ink-muted hover:text-brand-ink font-medium transition-colors text-sm hidden sm:inline-flex">
            Masuk
          </Link>
          <Magnetic strength={6} glow>
            <Button
              render={<Link to="/sign-up" />}
              className="h-auto bg-brand-ink hover:bg-brand-rust text-brand-cream font-bold text-sm px-5 py-2.5 transition-colors"
            >
              Daftar Gratis
            </Button>
          </Magnetic>
        </div>
      </nav>
    </motion.header>
  );
}

function Footer() {
  return (
    <footer className="glass-nav-dark py-16 relative text-primary-foreground">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
          {/* Logo + flag */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex flex-col w-2.5 h-5" aria-hidden="true">
                <div className="flex-1 bg-brand-cream/60" />
                <div className="flex-1 bg-brand-rust" />
                <div className="flex-1 bg-brand-tan" />
              </div>
              <span className="font-serif text-xl font-bold text-primary-foreground tracking-tight">DeutschUp</span>
            </div>
            <p className="text-sm text-cream-muted max-w-xs leading-relaxed">
              Platform belajar bahasa Jerman berbasis AI untuk siswa Indonesia.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-cream-subtle mb-3">Platform</p>
              <div className="space-y-2">
                <a href="#fitur" className="flex items-center min-h-11 text-sm text-cream-muted hover:text-primary-foreground transition-colors">Fitur</a>
                <a href="#roadmap" className="flex items-center min-h-11 text-sm text-cream-muted hover:text-primary-foreground transition-colors">Kurikulum</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-cream-subtle mb-3">Akun</p>
              <div className="space-y-2">
                <Link to="/sign-in" className="flex items-center min-h-11 text-sm text-cream-muted hover:text-primary-foreground transition-colors">Masuk</Link>
                <Link to="/sign-up" className="flex items-center min-h-11 text-sm text-cream-muted hover:text-primary-foreground transition-colors">Daftar</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar — editorial divider */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream-subtle">© 2026 DeutschUp. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-2 text-xs text-cream-subtle">
            {/* German flag — same construction as the header logo */}
            <div className="flex flex-col w-2.5 h-4" aria-hidden="true">
              <div className="flex-1 bg-brand-cream/60" />
              <div className="flex-1 bg-brand-rust" />
              <div className="flex-1 bg-brand-tan" />
            </div>
            <span>Deutsch lernen macht Spaß</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-background focus:px-4 focus:py-2 focus:text-foreground">
        Langsung ke konten utama
      </a>
      <Header />
      <OneTapGuest />
      <main id="main-content">
        <Hero />
        <ProductShowcase />
        <LearningRoadmap />
        <SocialProof />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
