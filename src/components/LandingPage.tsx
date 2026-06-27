import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import Hero from './Hero';
import ProductShowcase from './ProductShowcase';
import LearningRoadmap from './LearningRoadmap';
import SocialProof from './SocialProof';
import CTASection from './CTASection';
import { motion } from 'motion/react';

function Header() {
  const { loginWithGoogle } = useAuthStore();

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-[#f5f0eb] border-b-2 border-[#0a0a0a] sticky top-0 z-50"
    >
      <nav className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-4 flex items-center justify-between" aria-label="Navigasi utama">
        <a href="/" className="flex items-center space-x-3">
          {/* German flag — small, precise */}
          <div className="flex flex-col w-2.5 h-5">
            <div className="flex-1 bg-[#0a0a0a]" />
            <div className="flex-1 bg-[#8b2500]" />
            <div className="flex-1 bg-[#c8956c]" />
          </div>
          <span className="font-serif text-xl font-bold text-[#0a0a0a] tracking-tight">DeutschUp</span>
        </a>
        <div className="flex items-center space-x-4">
          <a href="/sign-in" className="text-[#0a0a0a]/60 hover:text-[#0a0a0a] font-medium transition-colors text-sm hidden sm:inline-flex" aria-label="Masuk ke akun Anda">
            Masuk
          </a>
          <Button onClick={loginWithGoogle} className="bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white font-bold rounded-none text-sm px-5 py-2.5 transition-all">
            Daftar Gratis
          </Button>
        </div>
      </nav>
    </motion.header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white/40 py-16 relative">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
          {/* Logo + flag */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex flex-col w-2.5 h-5">
                <div className="flex-1 bg-white/60" />
                <div className="flex-1 bg-[#8b2500]" />
                <div className="flex-1 bg-[#c8956c]" />
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-tight">DeutschUp</span>
            </div>
            <p className="text-sm text-white/30 max-w-xs leading-relaxed">
              Platform belajar bahasa Jerman berbasis AI untuk siswa Indonesia.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/30 mb-3">Platform</p>
              <div className="space-y-2">
                <a href="#fitur" className="block text-sm text-white/50 hover:text-white transition-colors">Fitur</a>
                <a href="#roadmap" className="block text-sm text-white/50 hover:text-white transition-colors">Kurikulum</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/30 mb-3">Akun</p>
              <div className="space-y-2">
                <a href="/sign-in" className="block text-sm text-white/50 hover:text-white transition-colors">Masuk</a>
                <a href="/sign-in" className="block text-sm text-white/50 hover:text-white transition-colors">Daftar</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar — editorial divider */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">© 2026 DeutschUp. All rights reserved.</p>
          <div className="flex items-center gap-1 text-xs text-white/20">
            <span>🇩🇪</span>
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
      <Header />
      <main>
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
