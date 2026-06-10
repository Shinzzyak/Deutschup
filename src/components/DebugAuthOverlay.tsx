import { useAuthStore } from '../stores/authStore';

export default function DebugAuthOverlay() {
  const { user, tierData, profileData, profileLoaded, loading } = useAuthStore();
  
  if (import.meta.env.VITE_DEBUG_AUTH !== 'true') return null;
  
  return (
    <div className="fixed bottom-0 right-0 bg-black text-white p-4 text-xs z-50 max-w-sm">
      <div className="font-bold mb-2">[AUTH DEBUG]</div>
      <div>user.id: {user?.id || 'NULL'}</div>
      <div>user.email: {user?.email || 'NULL'}</div>
      <div>loading: {String(loading)}</div>
      <div>profileLoaded: {String(profileLoaded)}</div>
      <div>tierData.tier: {tierData?.tier || 'NULL'}</div>
      <div>tierData.subscription: {tierData?.subscription || 'NULL'}</div>
      <div>tierData.pro_expires_at: {tierData?.pro_expires_at || 'NULL'}</div>
      <div>profileData.role: {profileData?.role || 'NULL'}</div>
    </div>
  );
}
