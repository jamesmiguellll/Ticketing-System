import React, { useState } from 'react';
import { useStellarWallet } from '../hooks/useStellarWallet';

export const StellarWalletPanel: React.FC = () => {
  const {
    publicKey,
    balance,
    isConnecting,
    isLoadingBalance,
    isSending,
    error,
    txHash,
    txStatus,
    connect,
    disconnect,
    sendXlm,
    refreshBalance
  } = useStellarWallet();

  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [formError, setFormError] = useState('');

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!destination.trim()) {
      setFormError('Destination address is required');
      return;
    }
    
    // Basic validation for amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }

    await sendXlm(destination, amount, memo);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Stellar Testnet Wallet</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!publicKey ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Connect your Freighter wallet to interact with the Stellar Testnet.
          </p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isConnecting ? 'Connecting...' : 'Connect Freighter Wallet'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Wallet Info Section */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">Connected Account</span>
              <button
                onClick={disconnect}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Disconnect
              </button>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-gray-200 px-2 py-1 rounded text-gray-800">
                {truncateAddress(publicKey)}
              </code>
              <button
                onClick={handleCopy}
                className="text-xs text-blue-600 hover:underline"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Balance Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
            <div>
              <span className="text-sm font-medium text-blue-800 block">Testnet Balance</span>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {isLoadingBalance ? (
                  <span className="text-base text-blue-600">Loading...</span>
                ) : (
                  `${balance || '0.0000000'} XLM`
                )}
              </div>
            </div>
            <button
              onClick={refreshBalance}
              disabled={isLoadingBalance}
              className="px-4 py-2 bg-white text-blue-600 text-sm font-medium border border-blue-200 rounded hover:bg-blue-50 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {/* Send XLM Form */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Send XLM</h3>
            
            {formError && (
              <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination Address
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="G..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSending}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (XLM)
                  </label>
                  <input
                    type="number"
                    step="0.0000001"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSending}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Memo (Optional)
                  </label>
                  <input
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="e.g. Payment for tickets"
                    maxLength={28}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSending}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending || !destination || !amount}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSending ? 'Sending Transaction...' : 'Send XLM'}
              </button>
            </form>

            {/* Transaction Status */}
            {txStatus === 'success' && txHash && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium mb-1">Transaction Successful!</p>
                <p className="text-sm text-green-700 break-all">
                  Hash: {txHash}
                </p>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                >
                  View on Stellar Expert
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
