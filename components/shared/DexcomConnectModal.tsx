import React, { useState } from 'react';
import { useDexcom, useAppContext } from '../../context/AppContext';
import { XMarkIcon } from './Icons';
import Card from '../ui/Card';

interface DexcomConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DexcomConnectModal: React.FC<DexcomConnectModalProps> = ({ isOpen, onClose }) => {
    const { connect, sync } = useDexcom();
    const { state, dispatch } = useAppContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [region, setRegion] = useState('US');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const isConnected = state.settings.dexcom?.connected;
    const connectedUsername = state.settings.dexcom?.username;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await connect(username, password, region);
        if (result.success) {
            await sync();
            onClose();
        } else {
            setError(result.error || 'Connection failed');
        }
        setLoading(false);
    };

    const handleDisconnect = () => {
        localStorage.removeItem('dexcomSessionId');
        localStorage.removeItem('dexcomUsername');
        localStorage.removeItem('dexcomAccountId');
        // Keep region if desired, or clear it
        dispatch({ type: 'UPDATE_SETTINGS', payload: { dexcom: { connected: false, region: 'US' } } });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                        {isConnected ? 'Dexcom Connection Status' : 'Connect Dexcom G6'}
                                    </h3>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {isConnected ? (
                                    <div className="space-y-4">
                                        <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Connected Successfully</h3>
                                                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                                    <p>Logged in as: <strong>{connectedUsername}</strong></p>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Your glucose data is being fetched from Dexcom Share.
                                        </p>

                                        <div className="mt-5 sm:mt-6">
                                            <button
                                                type="button"
                                                onClick={handleDisconnect}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                                            >
                                                Disconnect / Log Off
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md text-sm text-blue-800 dark:text-blue-200 mb-4 text-left">
                                            Connect your Dexcom account to import glucose readings. Your credentials are sent securely to your local server only.
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left">Username</label>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={e => setUsername(e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left">Password</label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left">Region</label>
                                            <select
                                                value={region}
                                                onChange={e => setRegion(e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            >
                                                <option value="US">United States</option>
                                                <option value="OUS">Outside US</option>
                                            </select>
                                        </div>

                                        {error && <p className="text-red-500 text-sm">{error}</p>}

                                        <div className="mt-5 sm:mt-6">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm disabled:opacity-50"
                                            >
                                                {loading ? 'Connecting...' : 'Connect Dexcom'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DexcomConnectModal;
