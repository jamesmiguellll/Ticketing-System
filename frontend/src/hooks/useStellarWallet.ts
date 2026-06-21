import { useState, useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import {
  isConnected as checkIsConnected,
  setAllowed,
  getAddress,
  signTransaction,
} from '@stellar/freighter-api';
import { STELLAR_HORIZON_URL, STELLAR_NETWORK_PASSPHRASE } from '../config/stellar';

export function useStellarWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  // Check if freighter is installed
  const checkFreighterInstalled = async () => {
    try {
      return await checkIsConnected();
    } catch {
      return false;
    }
  };

  const fetchBalance = useCallback(async (address: string) => {
    setIsLoadingBalance(true);
    setError(null);
    try {
      const server = new StellarSdk.Horizon.Server(STELLAR_HORIZON_URL);
      const account = await server.loadAccount(address);
      const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
      setBalance(nativeBalance ? nativeBalance.balance : '0.0000000');
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError('Your Testnet account is not funded yet. Fund it using Stellar Friendbot, then refresh balance.');
        setBalance('0.0000000');
      } else {
        setError('Failed to fetch balance from Horizon.');
      }
    } finally {
      setIsLoadingBalance(false);
    }
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const installed = await checkFreighterInstalled();
      if (!installed) {
        throw new Error('Freighter wallet is required. Install the Freighter browser extension and switch to Testnet.');
      }

      await setAllowed();
      const response = await getAddress();
      
      let addressStr = '';
      if (typeof response === 'string') {
        addressStr = response;
      } else if (response && response.address) {
        addressStr = response.address;
      } else if (response && response.error) {
        throw new Error(response.error);
      }

      if (!addressStr) {
        throw new Error('Failed to get address from Freighter');
      }

      setPublicKey(addressStr);
      await fetchBalance(addressStr);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setPublicKey(null);
    setBalance(null);
    setTxStatus('idle');
    setTxHash(null);
    setError(null);
  };

  const sendXlm = async (destination: string, amount: string, memo?: string) => {
    if (!publicKey) return;
    
    setIsSending(true);
    setTxStatus('pending');
    setError(null);
    setTxHash(null);

    try {
      const server = new StellarSdk.Horizon.Server(STELLAR_HORIZON_URL);
      
      // Load source account
      let sourceAccount;
      try {
        sourceAccount = await server.loadAccount(publicKey);
      } catch (err: any) {
        throw new Error('Source account not found. Is it funded?');
      }

      // Build transaction
      const transactionBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
      })
      .addOperation(
        StellarSdk.Operation.payment({
          destination,
          asset: StellarSdk.Asset.native(),
          amount,
        })
      )
      .setTimeout(180);

      if (memo) {
        transactionBuilder.addMemo(StellarSdk.Memo.text(memo));
      }

      const transaction = transactionBuilder.build();
      const xdr = transaction.toXDR();

      // Sign transaction via Freighter
      const signedResult = await signTransaction(xdr, {
        networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
      });

      let signedTxXdr = '';
      if (typeof signedResult === 'string') {
        signedTxXdr = signedResult;
      } else if (signedResult && signedResult.signedTxXdr) {
        signedTxXdr = signedResult.signedTxXdr;
      } else if (signedResult && signedResult.error) {
        throw new Error(signedResult.error);
      } else {
        throw new Error('User rejected signing or an unknown error occurred');
      }

      // Submit transaction
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedTxXdr,
        STELLAR_NETWORK_PASSPHRASE
      );

      const response = await server.submitTransaction(signedTx as any);
      
      if (response.successful) {
        setTxHash(response.hash);
        setTxStatus('success');
        await fetchBalance(publicKey);
      } else {
        throw new Error('Transaction submission failed');
      }

    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      setTxStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const refreshBalance = () => {
    if (publicKey) fetchBalance(publicKey);
  };

  return {
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
  };
}
