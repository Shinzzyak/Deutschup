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
    active: 'bg-green-100 text-green-800',
    missing_key: 'bg-yellow-100 text-yellow-800',
    invalid: 'bg-red-100 text-red-800',
    disabled: 'bg-gray-100 text-gray-800',
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
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
            <p className="text-sm text-gray-500">Priority: {provider.priority}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[provider.status]}`}>
            {statusLabels[provider.status]}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-20">Source:</span>
            <span className="text-gray-900">{sourceLabels[provider.source]}</span>
          </div>
          
          {provider.maskedKey && (
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-20">Key:</span>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                {provider.maskedKey}
              </code>
            </div>
          )}

          {provider.lastValidated && (
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-20">Validated:</span>
              <span className="text-gray-900">
                {new Date(provider.lastValidated).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {provider.status === 'missing_key' ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Key
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Update Key
              </button>
              <button
                onClick={() => setShowValidateModal(true)}
                className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
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