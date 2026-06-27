import React, { useState } from 'react';
import { useAISecretsStore } from '../../stores/aiSecretsStore';

interface AddSecretModalProps {
  providerId: string;
  providerName: string;
  onClose: () => void;
}

export default function AddSecretModal({ providerId, providerName, onClose }: AddSecretModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addSecret = useAISecretsStore((s) => s.addSecret);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addSecret(providerId, 'api_key', apiKey.trim());
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#f5f0eb]   w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-[#0a0a0a]/20">
          <h3 className="text-lg font-semibold text-gray-900">
            {success ? 'Success' : `Add API Key for ${providerName}`}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {success ? (
            <div className="text-center py-4">
              <div className="text-[#2d8a4e] text-4xl mb-2">✓</div>
              <p className="text-gray-900">API key saved successfully</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="apiKey" className="block text-sm font-medium text-[#0a0a0a]/70 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-[#0a0a0a]/30   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-[#0a0a0a]/70"
                  placeholder="Enter your API key"
                  autoFocus
                />
                <p className="mt-1 text-sm text-[#0a0a0a]/50">
                  Key will be stored securely in the database
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-[#f5f0eb] border border-[#8b2500]/20 ">
                  <p className="text-sm text-[#8b2500]">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-[#0a0a0a]/70 bg-[#0a0a0a]/5  hover:bg-[#0a0a0a]/10 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium bg-[#0a0a0a] bg-[#0a0a0a]/80  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Key'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}