'use client'

import React, { useState, FormEvent } from 'react';

interface TransferCallData {
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
}

const BlockchainForm: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [transferCallData, setTransferCallData] = useState<TransferCallData | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/agent/call_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test',
        },
        body: JSON.stringify({ request: prompt }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Raw response:', result);
      console.log(result.data);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-6">
      <div className="max-w-md mx-auto space-y-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="prompt" 
              className="block text-sm font-medium text-neutral-200 mb-2"
            >
              Enter your prompt
            </label>
            <input
              type="text"
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Type your request..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </form>

        {transferCallData && (
          <div className="mt-6 p-4 bg-neutral-800 rounded-md">
            <h2 className="text-lg font-semibold text-neutral-200 mb-3">Call Data Response:</h2>
            <pre className="text-sm text-neutral-300 overflow-x-auto">
              {JSON.stringify(transferCallData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainForm;