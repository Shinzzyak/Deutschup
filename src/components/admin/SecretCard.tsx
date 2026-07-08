import React, { useState } from 'react';
import { useAISecretsStore, ProviderStatus } from '../../stores/aiSecretsStore';
import AddSecretModal from './AddSecretModal';
import ValidateSecretModal from './ValidateSecretModal';

interface SecretCardProps {
  provider: ProviderStatus;
}

export default function SecretCard({ provider }: SecretCardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);

  const statusColors = {
    active: 'bg-green-500/15 text-green-300 border border-green-500/25',
    missing_key: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/25',
    invalid: 'bg-red-500/15 text-red-300 border border-red-500/25',
    disabled: 'bg-muted text-muted-foreground border border-border',
  };

  const statusLabels = {
    active: 'Active',
    missing_key: 'Missing Key',
    invalid: 'Invalid Key',
    disabled: 'Disabled',
  };

  const sourceLabels = {
    database: 'Database',
    environment: 'Environment Variable',
    none: 'None',
  };

  return (
    <>
      <div className="st-card p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-serif font-semibold text-foreground">{provider.name}</h3>
            <p className="text-sm text-muted-foreground">Priority: {provider.priority}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium  ${statusColors[provider.status]}`}>
            {statusLabels[provider.status]}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground w-20">Source:</span>
            <span className="text-foreground">{sourceLabels[provider.source]}</span>
          </div>
          
          {provider.maskedKey && (
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground w-20">Key:</span>
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">
                {provider.maskedKey}
              </code>
            </div>
          )}

          {provider.lastValidated && (
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground w-20">Validated:</span>
              <span className="text-foreground">
                {new Date(provider.lastValidated).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {provider.status === 'missing_key' ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-primary text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring text-primary-foreground"
            >
              Add Key
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-primary text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring text-primary-foreground"
              >
                Update Key
              </button>
              <button
                onClick={() => setShowValidateModal(true)}
                className="px-3 py-1.5 bg-green-700 text-sm font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-white"
              >
                Validate
              </button>
            </>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddSecretModal
          providerId={provider.id}
          providerName={provider.name}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showValidateModal && (
        <ValidateSecretModal
          providerId={provider.id}
          providerName={provider.name}
          onClose={() => setShowValidateModal(false)}
        />
      )}
    </>
  );
}
