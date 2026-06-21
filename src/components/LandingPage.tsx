import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import Hero from './Hero';
import ProductShowcase from './ProductShowcase';
import LearningRoadmap from './LearningRoadmap';
import SocialProof from './SocialProof';
import CTASection from './CTASection';

function Header() {
  const { loginWithGoogle } = useAuthStore();

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between" aria-label="Navigasi utama">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-0.5">
            <div className="w-3 h-5 bg-slate-900 rounded-sm"></div>
            <div className="w-3 h-5 bg-red-600 rounded-sm"></div>
            <div className="w-3 h-5 bg-[#F2C94C] rounded-sm"></div>
          </div>
          <span className="font-bold tracking-tight text-xl text-slate-900">DeutschUp</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/sign-in" className="text-slate-500 hover:text-slate-900 font-medium transition-colors text-sm" aria-label="Masuk ke akun Anda">
            Masuk
          </a>
          <Button onClick={loginWithGoogle} className="bg-gradient-to-r from-[#F2C94C] to-yellow-500 hover:from-[#E0B73A] hover:to-yellow-600 text-[#1F2937] font-bold rounded-xl text-sm px-5 py-2.5 shadow-md shadow-[#F2C94C]/30">
            Daftar Gratis
          </Button>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-0.5">
              <div className="w-2.5 h-4 bg-slate-600 rounded-sm"></div>
              <div className="w-2.5 h-4 bg-red-500 rounded-sm"></div>
              <div className="w-2.5 h-4 bg-[#F2C94C] rounded-sm"></div>
            </div>
            <span className="font-bold text-white">DeutschUp</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#roadmap" className="hover:text-white transition-colors">Kurikulum</a>
            <a href="/login" className="hover:text-white transition-colors">Masuk</a>
          </div>
          <p className="text-sm">© 2026 DeutschUp. All rights reserved.</p>
        </div>
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
