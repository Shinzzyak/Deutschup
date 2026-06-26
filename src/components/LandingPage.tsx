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
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full glass-strong border-b border-white/30 sticky top-0 z-50"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between" aria-label="Navigasi utama">
        <div className="flex items-center space-x-2.5">
          <div className="flex space-x-[3px] rounded-md overflow-hidden shadow-sm">
            <div className="w-2.5 h-4 bg-slate-800 rounded-sm" />
            <div className="w-2.5 h-4 bg-red-600 rounded-sm" />
            <div className="w-2.5 h-4 bg-amber-400 rounded-sm" />
          </div>
          <span className="font-bold tracking-tight text-xl text-slate-900">DeutschUp</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/sign-in" className="text-slate-500 hover:text-slate-900 font-medium transition-colors text-sm hidden sm:inline-flex" aria-label="Masuk ke akun Anda">
            Masuk
          </a>
          <Button onClick={loginWithGoogle} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm px-5 py-2.5 shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition-all">
            Daftar Gratis
          </Button>
        </div>
      </nav>
    </motion.header>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-b from-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-2.5">
            <div className="flex space-x-[3px] rounded-md overflow-hidden">
              <div className="w-2.5 h-4 bg-slate-600 rounded-sm" />
              <div className="w-2.5 h-4 bg-red-500 rounded-sm" />
              <div className="w-2.5 h-4 bg-amber-400 rounded-sm" />
            </div>
            <span className="font-bold text-white text-lg">DeutschUp</span>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#roadmap" className="hover:text-white transition-colors">Kurikulum</a>
            <a href="/sign-in" className="hover:text-white transition-colors">Masuk</a>
          </div>
          <p className="text-sm text-slate-500">© 2026 DeutschUp. All rights reserved.</p>
        </div>

        {/* Divider */}
        <div className="divider-fade my-8" />

        <p className="text-center text-xs text-slate-600">
          Platform belajar bahasa Jerman berbasis AI untuk siswa Indonesia.
        </p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
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
