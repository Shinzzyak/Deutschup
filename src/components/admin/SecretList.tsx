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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading providers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchProviders}
          className="mt-2 text-sm text-red-600 underline hover:text-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">AI Provider Secrets</h2>
        <button
          onClick={fetchProviders}
          disabled={loading}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
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
        <div className="text-center py-8 text-gray-500">
          No providers found
        </div>
      )}
    </div>
  );
}