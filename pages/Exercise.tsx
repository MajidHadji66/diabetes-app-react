
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import type { Exercise } from '../types';
import { ExerciseIcon } from '../components/shared/Icons';

const Exercise: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [type, setType] = useState('');
    const [duration, setDuration] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!type || !duration) return;

        const newExercise: Exercise = {
            id: `e-${new Date().getTime()}`,
            type,
            duration: parseInt(duration, 10),
            timestamp: new Date()
        };

        dispatch({ type: 'ADD_EXERCISE', payload: newExercise });
        setType('');
        setDuration('');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Exercise Log</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Log an Activity</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="exerciseType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Type</label>
                                <input type="text" id="exerciseType" value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g., Brisk Walk" required />
                            </div>
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (minutes)</label>
                                <input type="number" id="duration" value={duration} onChange={e => setDuration(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="30" required />
                            </div>
                            <button type="submit" className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">Add Activity</button>
                        </form>
                    </Card>
                    <Card className="mt-6">
                        <h3 className="font-bold text-lg mb-2">Smart Suggestions</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            <li>A 15-minute walk after meals can help blunt glucose spikes.</li>
                            <li>Aim for 3 sessions of strength training per week.</li>
                            <li>Listen to your body. Rest is just as important as activity.</li>
                        </ul>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recent Activities</h2>
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                        {state.exercises.length > 0 ? (
                            // Fix: Explicitly sort exercises by timestamp to ensure correct order.
                            state.exercises.slice().sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(ex => (
                                <Card key={ex.id}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="p-3 rounded-full mr-4 bg-orange-100 dark:bg-orange-900">
                                                <ExerciseIcon className="w-6 h-6 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-gray-800 dark:text-white">{ex.type}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{ex.timestamp.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-orange-600 dark:text-orange-400 text-lg">{ex.duration} mins</p>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <Card><p>No activities logged yet.</p></Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Exercise;