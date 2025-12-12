
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import GlucoseChart from '../components/dashboard/GlucoseChart';
import { useAppContext } from '../context/AppContext';

import DexcomConnectModal from '../components/shared/DexcomConnectModal';

type TimeRange = '24h' | '7d' | '30d';

const CGMData: React.FC = () => {
    const { state } = useAppContext();
    const { glucoseReadings, settings } = state;
    const [timeRange, setTimeRange] = useState<TimeRange>('24h');
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

    const now = new Date().getTime();
    let days = 1;
    if (timeRange === '7d') days = 7;
    if (timeRange === '30d') days = 30;

    const filteredData = glucoseReadings.filter(r => r.timestamp.getTime() > now - days * 24 * 60 * 60 * 1000);

    const timeInRange = filteredData.filter(r => r.value >= settings.glucoseTargetRange.min && r.value <= settings.glucoseTargetRange.max).length;
    const timeHigh = filteredData.filter(r => r.value > settings.glucoseTargetRange.max).length;
    const timeLow = filteredData.filter(r => r.value < settings.glucoseTargetRange.min).length;
    const totalReadings = filteredData.length;

    const getPercentage = (value: number) => totalReadings > 0 ? ((value / totalReadings) * 100).toFixed(1) : '0.0';

    const averageGlucose = totalReadings > 0 ? (filteredData.reduce((acc, r) => acc + r.value, 0) / totalReadings).toFixed(0) : 'N/A';

    const username = settings.dexcom?.username?.split('@')[0];
    const isConnected = settings.dexcom?.connected;

    return (
        <div>
            <DexcomConnectModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">CGM Data Explorer</h1>
                <div
                    onClick={() => setIsConnectModalOpen(true)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm cursor-pointer hover:opacity-80 transition-opacity ${isConnected ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                >
                    <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        {isConnected ? `Live Data: ${username || 'Connected'}` : 'Demo Mode (Click to Connect)'}
                    </span>
                </div>
            </div>

            {isConnected && (
                <Card className="mb-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-100">Historical Data Notice</h3>
                            <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                                <p>
                                    The Dexcom Share API only allows fetching the last <strong>24 hours</strong> of data.
                                    Your 7-day and 30-day statistics will become more accurate over time as this app builds its own local history from your daily usage.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Glucose Trends</h2>
                    <div className="flex space-x-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                        {(['24h', '7d', '30d'] as TimeRange[]).map(range => (
                            <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${timeRange === range ? 'bg-white dark:bg-gray-800 shadow text-primary-600' : 'text-gray-600 dark:text-gray-300'}`}>
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
                <GlucoseChart data={filteredData} height={400} />
            </Card>

            <div className="mt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Statistics for {timeRange}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <h3 className="font-semibold text-gray-500 dark:text-gray-400">Avg. Glucose</h3>
                        <p className="text-3xl font-bold text-primary-600">{averageGlucose} <span className="text-lg">mg/dL</span></p>
                    </Card>
                    <Card>
                        <h3 className="font-semibold text-gray-500 dark:text-gray-400">Time in Range</h3>
                        <p className="text-3xl font-bold text-green-500">{getPercentage(timeInRange)}%</p>
                        <p className="text-sm text-gray-400">{settings.glucoseTargetRange.min}-{settings.glucoseTargetRange.max} mg/dL</p>
                    </Card>
                    <Card>
                        <h3 className="font-semibold text-gray-500 dark:text-gray-400">Time High</h3>
                        <p className="text-3xl font-bold text-red-500">{getPercentage(timeHigh)}%</p>
                        <p className="text-sm text-gray-400">&gt; {settings.glucoseTargetRange.max} mg/dL</p>
                    </Card>
                    <Card>
                        <h3 className="font-semibold text-gray-500 dark:text-gray-400">Time Low</h3>
                        <p className="text-3xl font-bold text-yellow-500">{getPercentage(timeLow)}%</p>
                        <p className="text-sm text-gray-400">&lt; {settings.glucoseTargetRange.min} mg/dL</p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CGMData;
