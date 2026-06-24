import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { isUserPro, getProDaysRemaining } from '../lib/subscription';
import { User, Mail, Calendar, Shield, CreditCard, Loader2, Save } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <User className="w-16 h-16 text-muted-foreground" />
        <p className="text-muted-foreground">Silakan login untuk melihat profil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-foreground mb-2">Profil 👤</h1>
        <p className="text-muted-foreground">Kelola informasi akun Anda.</p>
      </header>

      <div className="bg-card rounded-3xl border border-border p-8 mb-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F2C94C] to-[#E0B73A] flex items-center justify-center text-3xl font-black text-[#1F2937]">
            {fullName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{fullName || 'Nama belum diatur'}</h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F2C94C]"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Email</label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || fullName === profileData?.full_name}
            className="w-full rounded-2xl py-6 text-lg font-bold"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {saved ? 'Tersimpan!' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border p-8">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-[#F2C94C]" />
          <h3 className="text-xl font-bold text-foreground">Langganan</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-2xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <p className="text-lg font-bold flex items-center gap-2">
              {activePro ? (
                <>
                  <Shield className="w-5 h-5 text-[#F2C94C]" />
                  <span className="text-[#F2C94C]">Pro Aktif</span>
                </>
              ) : (
                <span className="text-muted-foreground">Free</span>
              )}
            </p>
          </div>

          <div className="bg-muted rounded-2xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Berlaku Hingga</p>
            <p className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              {activePro && daysRemaining > 0
                ? `${daysRemaining} hari lagi`
                : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
