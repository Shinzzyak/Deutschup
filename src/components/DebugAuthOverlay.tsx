import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

export default function DebugAuthOverlay() {
  const { user, tierData, profileData, profileLoaded, loading } = useAuthStore();
  const [rawProfile, setRawProfile] = useState<any>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [querySuccess, setQuerySuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchRawProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          setQueryError(error.message);
          setQuerySuccess(false);
        } else if (!data) {
          setQueryError('Profile not found (0 rows)');
          setQuerySuccess(false);
        } else {
          setRawProfile(data);
          setQueryError(null);
          setQuerySuccess(true);
        }
      } catch (e: any) {
        setQueryError(e.message);
        setQuerySuccess(false);
      }
    };
    
    fetchRawProfile();
  }, [user?.id]);
  
  if (import.meta.env.VITE_DEBUG_AUTH !== 'true' && import.meta.env.MODE !== 'development') return null;
  
  return (
    <div className="fixed bottom-0 right-0 bg-black text-white p-4 text-xs z-50 max-w-sm max-h-96 overflow-y-auto">
      <div className="font-bold mb-2">[AUTH DEBUG]</div>
      <div>user.id: {user?.id || 'NULL'}</div>
      <div>user.email: {user?.email || 'NULL'}</div>
      <div>loading: {String(loading)}</div>
      <div>profileLoaded: {String(profileLoaded)}</div>
      <div className="border-t border-gray-600 mt-2 pt-2">tierData.tier: {tierData?.tier || 'NULL'}</div>
      <div>tierData.subscription: {tierData?.subscription || 'NULL'}</div>
      <div>tierData.pro_expires_at: {tierData?.pro_expires_at || 'NULL'}</div>
      <div>profileData.role: {profileData?.role || 'NULL'}</div>
      <div className="border-t border-gray-600 mt-2 pt-2 font-bold">[RAW PROFILE QUERY]</div>
      <div>querySuccess: {String(querySuccess)}</div>
      <div>queryError: {queryError || 'none'}</div>
      <div className="mt-1">rawProfile.subscription: {rawProfile?.subscription || 'NULL'}</div>
      <div>rawProfile.tier: {rawProfile?.tier || 'NULL'}</div>
      <div>rawProfile.pro_expires_at: {rawProfile?.pro_expires_at || 'NULL'}</div>
      <div>rawProfile.role: {rawProfile?.role || 'NULL'}</div>
    </div>
  );
}
