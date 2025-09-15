
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import GlucoseChart from '../components/dashboard/GlucoseChart';
import { useAppContext } from '../context/AppContext';

type TimeRange = '24h' | '7d' | '30d';

const CGMData: React.FC = () => {
    const { state } = useAppContext();
    const { glucoseReadings, settings } = state;
    const [timeRange, setTimeRange] = useState<TimeRange>('24h');

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

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">CGM Data Explorer</h1>
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
