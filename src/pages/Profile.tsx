import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { isUserPro, getProDaysRemaining } from '../lib/subscription';
import { User, Mail, Calendar, Shield, CreditCard, Loader2, Save, Award, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Profile() {
  const { user, profileData, tierData } = useAuthStore();
  const [fullName, setFullName] = useState(profileData?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const activePro = isUserPro(
    { subscription: tierData?.subscription, pro_expires_at: tierData?.pro_expires_at },
    tierData?.role || profileData?.role
  );
  const daysRemaining = getProDaysRemaining(
    { subscription: tierData?.subscription, pro_expires_at: tierData?.pro_expires_at },
    tierData?.role || profileData?.role
  );

  useEffect(() => {
    if (profileData?.full_name) setFullName(profileData.full_name);
  }, [profileData?.full_name]);

  const handleSave = async () => {
    if (!user) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: fullName }, { onConflict: 'id' });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to update profile:', e);
      alert('Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-2">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Sesi Berakhir</h2>
        <p className="text-muted-foreground max-w-xs">Silakan login kembali untuk mengakses dan mengelola profil Anda.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-16 px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground mb-3">
            Profil <span className="text-[#F2C94C]">.</span>
          </h1>
          <p className="text-muted-foreground text-lg">Kelola identitas dan preferensi belajar Anda.</p>
        </div>
        <div className="flex items-center gap-3 bg-muted/50 p-1 ">
          <div className="px-4 py-2 rounded-xl bg-background shadow-sm text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#F2C94C]" />
            {activePro ? 'Pro Member' : 'Free Member'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-1">
          <div className="bg-[#f5f0eb] border-2 border-[#0a0a0a] rounded-[2rem] border border-border p-8 sticky top-24 overflow-hidden relative group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F2C94C]/10 rounded-full blur-3xl group-hover:bg-[#F2C94C]/20 transition-all duration-500" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#F2C94C] to-[#E0B73A] flex items-center justify-center text-5xl font-black text-[#1F2937]  mb-6 ring-4 ring-background">
                {fullName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-1 leading-tight">
                {fullName || 'User DeutschUp'}
              </h2>
              <p className="text-muted-foreground text-sm mb-6 flex items-center gap-2 justify-center">
                <Mail className="w-3 h-3" /> {user.email}
              </p>
              
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between p-3  bg-muted/50 border border-border/50">
                  <span className="text-xs font-medium text-muted-foreground">Status Akun</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${activePro ? 'bg-[#F2C94C]/20 text-[#B8952E]' : 'bg-muted text-muted-foreground'}`}>
                    {activePro ? 'Pro' : 'Free'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3  bg-muted/50 border border-border/50">
                  <span className="text-xs font-medium text-muted-foreground">Berlaku Hingga</span>
                  <span className="text-xs font-bold">{activePro && daysRemaining > 0 ? `${daysRemaining} hari lagi` : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Settings Card */}
          <div className="bg-[#f5f0eb] border-2 border-[#0a0a0a] rounded-[2rem] border border-border p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#F2C94C]/10 rounded-lg">
                <User className="w-5 h-5 text-[#F2C94C]" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Informasi Dasar</h3>
            </div>

            <div className="grid gap-6">
              <div className="group">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block ml-1 group-focus-within:text-[#F2C94C] transition-colors">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-5 py-4  bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F2C94C]/50 transition-all"
                    placeholder="Masukkan nama lengkap Anda"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block ml-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-5 py-4  bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Shield className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving || fullName === profileData?.full_name}
                  className=" px-8 py-6 text-md font-bold transition-all hover:scale-[1.02] active:scale-[0.98]  shadow-[#F2C94C]/20"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  {saved ? 'Tersimpan!' : 'Simpan Perubahan'}
                </Button>
              </div>
            </div>
          </div>

          {/* Subscription Perks Card */}
          <div className="bg-gradient-to-br from-[#1F2937] to-[#111827] rounded-[2rem] border border-white/10 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="w-32 h-32 text-white" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#F2C94C]/20 rounded-lg">
                  <Award className="w-5 h-5 text-[#F2C94C]" />
                </div>
                <h3 className="text-xl font-bold">Keuntungan Member</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PerkItem 
                  icon={CheckCircle2} 
                  text="Akses penuh level A1-B2" 
                  active={activePro} 
                />
                <PerkItem 
                  icon={Zap} 
                  text="Unlimited chat Herr Deutsch" 
                  active={activePro} 
                />
                <PerkItem 
                  icon={Award} 
                  text="Sertifikat progres belajar" 
                  active={activePro} 
                />
                <PerkItem 
                  icon={Calendar} 
                  text="Simulasi ujian mingguan" 
                  active={activePro} 
                />
              </div>

              {!activePro && (
                <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                  <p className="text-sm text-white/60">Ingin membuka semua fitur?</p>
                  <Button 
                    variant="outline" 
                    className="rounded-xl border-white/20 text-white hover:bg-white/10 bg-transparent px-6"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    Upgrade Pro <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerkItem({ icon: Icon, text, active }: { icon: any; text: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-4  transition-all ${active ? 'bg-white/10 border border-white/10' : 'bg-white/5 opacity-50 grayscale'}`}>
      <Icon className={`w-5 h-5 ${active ? 'text-[#F2C94C]' : 'text-white/40'}`} />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
