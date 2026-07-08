import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { dbProxy, supabase } from '../lib/supabase';
import { isUserPro, getProDaysRemaining } from '../lib/subscription';
import { User, Mail, Calendar, Shield, Loader2, Save, Award, Zap, CheckCircle2, ArrowRight, Camera, LifeBuoy } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Profile() {
  const { user, profileData, tierData } = useAuthStore();
  const [fullName, setFullName] = useState(profileData?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profileData?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (profileData?.avatar_url) setAvatarUrl(profileData.avatar_url);
  }, [profileData?.full_name, profileData?.avatar_url]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type + size (max 2MB)
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Upload to Supabase Storage: avatars/{userId}/avatar
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = urlData.publicUrl;
      setAvatarUrl(newAvatarUrl);

      // Auto-save avatar_url to profile
      const result = await dbProxy('upsert-profile', { userId: user.id, avatar_url: newAvatarUrl });
      if (result.error) throw new Error(result.error);
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      alert('Gagal upload foto: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const result = await dbProxy('upsert-profile', { userId: user.id, full_name: fullName });
      if (result.error) throw new Error(result.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      console.error('Failed to update profile:', e);
      alert('Gagal menyimpan profil: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-6">
        <div className="w-20 h-20 st-card/10 flex items-center justify-center mb-2">
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
          <h1 className="text-5xl font-serif font-black tracking-tighter text-[#0a0a0a] mb-3">
            Profil <span className="text-[#8b2500]">.</span>
          </h1>
          <p className="text-muted-foreground text-lg">Kelola identitas dan preferensi belajar Anda.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#f5f0eb] p-1 border-2 border-[#0a0a0a]">
          <div className="px-4 py-2 bg-[#f5f0eb] text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#8b2500]" />
            {activePro ? 'Pro Member' : 'Free Member'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-1">
          <div className="st-card p-8 sticky top-24 overflow-hidden">
            <div className="flex flex-col items-center text-center">
              {/* Avatar with upload overlay */}
              <div className="relative mb-6 group">
                <div className="w-32 h-32 bg-[#c8956c] flex items-center justify-center text-5xl font-black text-[#0a0a0a] border-2 border-[#0a0a0a] overflow-hidden rounded-none">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    fullName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                {/* Click overlay to upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="w-8 h-8 text-white" />
                      <span className="text-xs text-white font-medium">Ganti Foto</span>
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-1 leading-tight">
                {fullName || 'User DeutschUp'}
              </h2>
              <p className="text-muted-foreground text-sm mb-6 flex items-center gap-2 justify-center">
                <Mail className="w-3 h-3" /> {user.email}
              </p>
              
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#f5f0eb] border border-[#0a0a0a]/10">
                  <span className="text-xs font-medium text-[#0a0a0a]/50">Status Akun</span>
                  <span className={`text-xs font-bold px-2 py-1 ${activePro ? 'bg-[#c8956c]/20 text-[#c8956c]' : 'bg-primary/5 text-[#0a0a0a]/50'}`}>
                    {activePro ? 'Pro' : 'Free'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#f5f0eb] border border-[#0a0a0a]/10">
                  <span className="text-xs font-medium text-[#0a0a0a]/50">Berlaku Hingga</span>
                  <span className="text-xs font-bold">{activePro && daysRemaining > 0 ? `${daysRemaining} hari lagi` : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Settings Card */}
          <div className="st-card p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#c8956c]/10">
                <User className="w-5 h-5 text-[#c8956c]" />
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
                  className=" px-8 py-6 text-md font-bold transition-all hover:scale-[1.02] active:scale-[0.98]  "
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  {saved ? 'Tersimpan!' : 'Simpan Perubahan'}
                </Button>
              </div>
            </div>
          </div>

          {/* Subscription Perks Card */}
          <div className="st-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap className="w-32 h-32 text-[#0a0a0a]" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#8b2500]/10">
                  <Award className="w-5 h-5 text-[#8b2500]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#0a0a0a]">Keuntungan Member</h3>
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
                <div className="mt-8 pt-8 border-t border-[#0a0a0a]/10 flex items-center justify-between">
                  <p className="text-sm text-[#0a0a0a]/60">Ingin membuka semua fitur?</p>
                  <Button 
                    variant="outline" 
                    className="border-2 border-[#0a0a0a]/20 hover:bg-primary/5 bg-transparent px-6 text-[#0a0a0a]"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    Upgrade Pro <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Support Card */}
          <div className="st-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#8b2500]/10">
                <LifeBuoy className="w-5 h-5 text-[#8b2500]" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Butuh Bantuan?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Ada kendala atau pertanyaan? Tim support siap membantu.
            </p>
            <a
              href="mailto:avresixx@gmail.com?subject=[DeutschUp%20Support]"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#8b2500] hover:underline"
            >
              <Mail className="w-4 h-4" />
              avresixx@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerkItem({ icon: Icon, text, active }: { icon: any; text: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-4 transition-all ${active ? 'bg-[#8b2500]/5 border border-[#8b2500]/10' : 'bg-primary/5 opacity-50 grayscale'}`}>
      <Icon className={`w-5 h-5 ${active ? 'text-[#8b2500]' : 'text-[#0a0a0a]/40'}`} />
      <span className="text-sm font-medium text-[#0a0a0a]">{text}</span>
    </div>
  );
}
