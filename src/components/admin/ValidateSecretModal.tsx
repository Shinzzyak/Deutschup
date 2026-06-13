import React, { useState, useEffect } from 'react';
import { useAISecretsStore } from '../../stores/aiSecretsStore';

interface ValidateSecretModalProps {
  providerId: string;
  providerName: string;
  onClose: () => void;
}

export default function ValidateSecretModal({ providerId, providerName, onClose }: ValidateSecretModalProps) {
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; error?: string } | null>(null);

  const validateSecret = useAISecretsStore((s) => s.validateSecret);

  useEffect(() => {
    const validate = async () => {
      setValidating(true);
      try {
        const res = await validateSecret(providerId);
        setResult(res);
      } catch (err: any) {
        setResult({ valid: false, error: err.message });
      } finally {
        setValidating(false);
      }
    };

    validate();
  }, [providerId, validateSecret]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Validate {providerName} API Key
          </h3>
        </div>

        <div className="px-6 py-4">
          {validating ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Validating API key...</p>
            </div>
          ) : result ? (
            <div className="text-center py-4">
              {result.valid ? (
                <>
                  <div className="text-green-600 text-5xl mb-3">✓</div>
                  <p className="text-lg font-medium text-green-600 mb-1">Valid</p>
                  <p className="text-sm text-gray-500">
                    API key is working correctly
                  </p>
                </>
              ) : (
                <>
                  <div className="text-red-600 text-5xl mb-3">✗</div>
                  <p className="text-lg font-medium text-red-600 mb-1">Invalid</p>
                  <p className="text-sm text-gray-500">
                    {result.error || 'API key is invalid or expired'}
                  </p>
                </>
              )}
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}