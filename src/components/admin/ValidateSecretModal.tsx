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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-serif font-semibold text-foreground">
            Validate {providerName} API Key
          </h3>
        </div>

        <div className="px-6 py-4">
          {validating ? (
            <div className="text-center py-8">
              <div className="animate-spin  h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Validating API key...</p>
            </div>
          ) : result ? (
            <div className="text-center py-4">
              {result.valid ? (
                <>
                  <div className="text-[#2d8a4e] text-5xl mb-3">✓</div>
                  <p className="text-lg font-medium text-[#2d8a4e] mb-1">Valid</p>
                  <p className="text-sm text-muted-foreground">
                    API key is working correctly
                  </p>
                </>
              ) : (
                <>
                  <div className="text-[#8b2500] text-5xl mb-3">✗</div>
                  <p className="text-lg font-medium text-[#8b2500] mb-1">Invalid</p>
                  <p className="text-sm text-muted-foreground">
                    {result.error || 'API key is invalid or expired'}
                  </p>
                </>
              )}
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-foreground/70 bg-muted hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
