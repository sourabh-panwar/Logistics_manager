'use client';

import React from 'react';
import {DispatchResult} from '@/lib/types';
import DispatchSummary from './DispatchSummary';

interface DispatchConfirmModalProps {
  result: DispatchResult;
  loading: boolean;
  onSave: () => void;
  onRecalculate: () => void;
  onCancel: () => void;
}

const DispatchConfirmModal: React.FC<DispatchConfirmModalProps> = ({
  result,
  loading,
  onSave,
  onRecalculate,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Dispatch Plan Calculated</h2>
          <DispatchSummary result={result} />

          <div className="flex gap-4 mt-6">
            <button
              onClick={onCancel}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition disabled:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={onRecalculate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition disabled:bg-blue-400"
            >
              Recalculate
            </button>
            <button
              onClick={onSave}
              disabled={loading}
              className={`font-bold py-2 px-6 rounded transition ml-auto ${
                loading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
              }`}
            >
              {loading ? 'Saving...' : '✓ Save & Activate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchConfirmModal;