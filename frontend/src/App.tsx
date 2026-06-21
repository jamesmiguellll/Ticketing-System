
import { StellarWalletPanel } from './components/StellarWalletPanel';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            FairTicket Integration
          </h1>
          <p className="text-lg text-gray-600">
            Level 1 Stellar Blockchain integration with Freighter Wallet.
          </p>
        </div>

        <StellarWalletPanel />
      </div>
    </div>
  );
}

export default App;
