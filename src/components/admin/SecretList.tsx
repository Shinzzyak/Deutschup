import React, { useEffect } from 'react';
import { useAISecretsStore } from '../../stores/aiSecretsStore';
import SecretCard from './SecretCard';

export default function SecretList() {
  const { providers, loading, error, fetchProviders } = useAISecretsStore();

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  if (loading && providers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin  h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading providers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f5f0eb] border border-[#8b2500]/20  p-4">
        <p className="text-[#8b2500]">Error: {error}</p>
        <button
          onClick={fetchProviders}
          className="mt-2 text-sm text-[#8b2500] underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif font-semibold text-[#0a0a0a]">AI Provider Secrets</h2>
        <button
          onClick={fetchProviders}
          disabled={loading}
          className="px-3 py-1.5 text-sm font-medium text-[#0a0a0a]/70 bg-[#0a0a0a]/5 hover:bg-[#0a0a0a]/10 focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/20 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="glass-subtle p-4 mb-4">
        <p className="text-sm text-blue-800">
          <strong>Security Note:</strong> API keys are stored securely in the database with RLS protection. 
          Only service role can access them. Keys are never displayed in full after storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider) => (
          <SecretCard key={provider.id} provider={provider} />
        ))}
      </div>

      {providers.length === 0 && !loading && (
        <div className="text-center py-8 text-[#0a0a0a]/50">
          No providers found
        </div>
      )}
    </div>
  );
}