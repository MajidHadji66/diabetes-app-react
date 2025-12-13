import React, { useState } from 'react';
import Card from '../components/ui/Card';
import GlucoseChart from '../components/dashboard/GlucoseChart';
import { useAppContext } from '../context/AppContext';
import { Meal, Exercise } from '../types';
import { DietIcon, ExerciseIcon, CgmIcon, JournalIcon } from '../components/shared/Icons';

const SummaryCard: React.FC<{ icon: React.ElementType, title: string, value: string, subValue?: string, color: string }> = ({ icon: Icon, title, value, subValue, color }) => (
    <Card className="flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
            {subValue && <p className="text-xs text-gray-400 dark:text-gray-500">{subValue}</p>}
        </div>
    </Card>
);

const TodayListItem: React.FC<{ item: Meal | Exercise }> = ({ item }) => {
    const isMeal = 'carbs' in item;
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
            <div>
                <p className="font-semibold">{isMeal ? item.name : item.type}</p>
                <p className="text-sm text-gray-500">{isMeal ? `${item.carbs}g carbs` : `${item.duration} mins`}</p>
            </div>
            <p className="text-sm text-gray-400">{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
    );
}

import DexcomConnectModal from '../components/shared/DexcomConnectModal';

const Dashboard: React.FC = () => {
    const { state } = useAppContext();
    const { glucoseReadings, meals, exercises, journalEntries, settings } = state;
    const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const latestGlucose = glucoseReadings.length > 0 ? glucoseReadings[glucoseReadings.length - 1] : null;
    const isTrendingUp = glucoseReadings.length > 1 && latestGlucose && latestGlucose.value > glucoseReadings[glucoseReadings.length - 2].value;

    const isHigh = latestGlucose && latestGlucose.value > settings.glucoseAlertLevels.high;
    const isLow = latestGlucose && latestGlucose.value < settings.glucoseAlertLevels.low;

    const todayMeals = meals.filter(m => m.timestamp >= startOfDay);
    const todayExercises = exercises.filter(e => e.timestamp >= startOfDay);
    const lastJournal = journalEntries.length > 0 ? journalEntries[0] : null;

    const twentyFourHourReadings = glucoseReadings.filter(r => r.timestamp.getTime() > (now.getTime() - 24 * 60 * 60 * 1000));

    const motivationalQuotes = [
        "Every small step in the right direction is a big achievement.",
        "Consistency is more important than perfection.",
        "You are more powerful than your challenges.",
        "Well done for tracking today. You're in control.",
        "Each healthy choice is a victory."
    ];
    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];


    const username = settings.dexcom?.username?.split('@')[0];
    const isConnected = settings.dexcom?.connected;

    return (
        <div>
            <DexcomConnectModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome Back{username ? `, ${username}` : ''}!</h1>
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

            {isHigh && <Card className="mb-6 bg-red-100 dark:bg-red-900 border border-red-400"><p className="text-red-800 dark:text-red-200 font-semibold">Alert: Your glucose is high ({latestGlucose?.value} mg/dL). Consider a short walk or drinking water.</p></Card>}
            {isLow && <Card className="mb-6 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400"><p className="text-yellow-800 dark:text-yellow-200 font-semibold">Alert: Your glucose is low ({latestGlucose?.value} mg/dL). Please have a quick snack.</p></Card>}


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <SummaryCard icon={CgmIcon} title="Latest Glucose" value={latestGlucose ? `${latestGlucose.value} mg/dL` : 'N/A'} subValue={isTrendingUp ? 'Trending Up' : 'Stable/Down'} color="bg-blue-500" />
                <SummaryCard icon={DietIcon} title="Today's Meals" value={`${todayMeals.length}`} subValue={`${todayMeals.reduce((sum, m) => sum + m.carbs, 0)}g carbs`} color="bg-green-500" />
                <SummaryCard icon={ExerciseIcon} title="Today's Activity" value={`${todayExercises.length}`} subValue={`${todayExercises.reduce((sum, e) => sum + e.duration, 0)} mins`} color="bg-orange-500" />
                <SummaryCard icon={JournalIcon} title="Last Journal Mood" value={lastJournal ? `${'😊'.repeat(lastJournal.mood)}${'😐'.repeat(5 - lastJournal.mood)}` : 'N/A'} subValue={lastJournal?.tag} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">24-Hour Glucose Trend</h2>
                        <GlucoseChart data={twentyFourHourReadings} />
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Today's Log</h2>
                        {todayMeals.length === 0 && todayExercises.length === 0 ? (
                            <p className="text-gray-500">No meals or exercises logged yet today.</p>
                        ) : (
                            <div className="max-h-60 overflow-y-auto">
                                {[...todayMeals, ...todayExercises].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(item => <TodayListItem key={item.id} item={item} />)}
                            </div>
                        )}
                    </Card>
                    <Card className="!bg-primary-500 text-white">
                        <p className="text-lg font-semibold">{quote}</p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;