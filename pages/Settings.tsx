
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { Settings as SettingsType, Medication, GlucoseReading, Meal, Exercise, MealType } from '../types';
import { ClockIcon, TrashIcon, BellIcon, BellSlashIcon } from '../components/shared/Icons';

// A simple toggle switch component for UI consistency
const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void }> = ({ enabled, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onChange}
        className={`${enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
    >
        <span
            aria-hidden="true"
            className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);


const Settings: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [settings, setSettings] = useState<SettingsType>(state.settings);
    const [hasChanges, setHasChanges] = useState(false);
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // State for the new medication form
    const [medName, setMedName] = useState('');
    const [medDosage, setMedDosage] = useState('');
    const [medTime, setMedTime] = useState('08:00');
    const [medReminder, setMedReminder] = useState(true);

    useEffect(() => {
        setSettings(state.settings);
        setHasChanges(false);
    }, [state.settings]);

    const handleSaveGlucoseSettings = () => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
        setHasChanges(false);
    };

    const handleRangeChange = (group: 'glucoseTargetRange' | 'glucoseAlertLevels', field: 'min' | 'max' | 'low' | 'high', value: string) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) return;

        setSettings(prev => ({
            ...prev,
            [group]: {
                ...prev[group],
                [field]: numValue
            }
        }));
        setHasChanges(true);
    };

    const handleAddMedication = (e: React.FormEvent) => {
        e.preventDefault();
        if (!medName || !medDosage || !medTime) return;

        const newMedication: Medication = {
            id: `med-${new Date().getTime()}`,
            name: medName,
            dosage: medDosage,
            time: medTime,
            reminderEnabled: medReminder,
        };
        dispatch({ type: 'ADD_MEDICATION', payload: newMedication });

        // Reset form
        setMedName('');
        setMedDosage('');
        setMedTime('08:00');
        setMedReminder(true);
    };

    const handleRemoveMedication = (id: string) => {
        dispatch({ type: 'REMOVE_MEDICATION', payload: { id } });
    };

    const handleToggleReminder = (id: string) => {
        dispatch({ type: 'TOGGLE_MEDICATION_REMINDER', payload: { id } });
    };

    const handleExportData = () => {
        const { glucoseReadings, meals, exercises } = state;
        const headers = 'type,id,timestamp,value,carbs,name,mealType,photoUrl,duration,exerciseType\n';
        
        const glucoseCsv = glucoseReadings.map(g => `glucose,${g.id},${g.timestamp.toISOString()},${g.value},,,,,,\n`).join('');
        const mealsCsv = meals.map(m => `meal,${m.id},${m.timestamp.toISOString()},,${m.carbs},${m.name},${m.type},${m.photoUrl},,\n`).join('');
        const exercisesCsv = exercises.map(e => `exercise,${e.id},${e.timestamp.toISOString()},,,,,,,${e.duration},${e.type}\n`).join('');

        const csvContent = headers + glucoseCsv + mealsCsv + exercisesCsv;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "diasync_export.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const rows = text.split('\n').slice(1); // Skip header

                const importedGlucose: GlucoseReading[] = [];
                const importedMeals: Meal[] = [];
                const importedExercises: Exercise[] = [];

                rows.forEach(row => {
                    if (!row) return;
                    const [type, id, timestamp, value, carbs, name, mealType, photoUrl, duration, exerciseType] = row.split(',');
                    const date = new Date(timestamp);

                    if (type === 'glucose') {
                        importedGlucose.push({ id, timestamp: date, value: parseInt(value) });
                    } else if (type === 'meal') {
                        importedMeals.push({ id, timestamp: date, name, carbs: parseInt(carbs), type: mealType as MealType, photoUrl });
                    } else if (type === 'exercise') {
                        importedExercises.push({ id, timestamp: date, duration: parseInt(duration), type: exerciseType });
                    }
                });

                dispatch({ type: 'IMPORT_DATA', payload: { glucoseReadings: importedGlucose, meals: importedMeals, exercises: importedExercises } });
                setImportStatus('success');
            } catch (err) {
                console.error("Error parsing CSV:", err);
                setImportStatus('error');
            } finally {
                 setTimeout(() => setImportStatus('idle'), 3000);
            }
        };
        reader.readAsText(file);
    };


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Settings</h1>
            
            <div className="space-y-8 max-w-2xl">
                <Card>
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Glucose Targets</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Range (mg/dL)</label>
                            <div className="flex items-center space-x-2 mt-1">
                                <input 
                                    type="number" 
                                    value={settings.glucoseTargetRange.min}
                                    onChange={e => handleRangeChange('glucoseTargetRange', 'min', e.target.value)}
                                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                                <span className="text-gray-500">to</span>
                                <input 
                                    type="number" 
                                    value={settings.glucoseTargetRange.max}
                                    onChange={e => handleRangeChange('glucoseTargetRange', 'max', e.target.value)}
                                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alert Levels (mg/dL)</label>
                            <div className="flex items-center space-x-2 mt-1">
                                <input 
                                    type="number" 
                                    placeholder="Low"
                                    value={settings.glucoseAlertLevels.low}
                                    onChange={e => handleRangeChange('glucoseAlertLevels', 'low', e.target.value)}
                                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                                <span className="text-gray-500">and</span>
                                 <input 
                                    type="number" 
                                    placeholder="High"
                                    value={settings.glucoseAlertLevels.high}
                                    onChange={e => handleRangeChange('glucoseAlertLevels', 'high', e.target.value)}
                                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>
                     <div className="mt-6">
                        <button 
                            onClick={handleSaveGlucoseSettings}
                            disabled={!hasChanges}
                            className="w-full sm:w-auto px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Save Glucose Settings
                        </button>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Medication Schedule</h2>
                    <form onSubmit={handleAddMedication} className="space-y-4 p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="medName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medication Name</label>
                                <input type="text" id="medName" value={medName} onChange={e => setMedName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g., Metformin" required/>
                            </div>
                             <div>
                                <label htmlFor="medDosage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dosage</label>
                                <input type="text" id="medDosage" value={medDosage} onChange={e => setMedDosage(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g., 500mg" required/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                             <div>
                                <label htmlFor="medTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                                <input type="time" id="medTime" value={medTime} onChange={e => setMedTime(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required/>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="medReminder" checked={medReminder} onChange={e => setMedReminder(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                <label htmlFor="medReminder" className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Reminder</label>
                            </div>
                        </div>
                         <button type="submit" className="w-full sm:w-auto px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Add Medication</button>
                    </form>
                    
                    <div className="mt-6 space-y-4">
                        {state.medications.length === 0 && <p className="text-gray-500 dark:text-gray-400">No medications scheduled.</p>}
                        {state.medications.map(med => (
                            <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center">
                                    <ClockIcon className="w-5 h-5 mr-3 text-primary-500"/>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white">{med.name} <span className="font-normal text-gray-500 dark:text-gray-400">({med.dosage})</span></p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{med.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        { med.reminderEnabled ? <BellIcon className="w-5 h-5 text-green-500"/> : <BellSlashIcon className="w-5 h-5 text-gray-400"/>}
                                        <ToggleSwitch enabled={med.reminderEnabled} onChange={() => handleToggleReminder(med.id)} />
                                    </div>
                                    <button onClick={() => handleRemoveMedication(med.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Data Management</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Export all your glucose, meal, and exercise data to a single CSV file for backup or external analysis.</p>
                            <button onClick={handleExportData} className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                Export All Data to CSV
                            </button>
                        </div>
                         <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Import data from a CSV file. The format must match the one used for exporting.</p>
                            <input type="file" accept=".csv" onChange={handleImportData} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                             {importStatus === 'success' && <p className="text-sm text-green-600 mt-2">Data imported successfully!</p>}
                             {importStatus === 'error' && <p className="text-sm text-red-600 mt-2">Failed to import data. Please check file format.</p>}
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default Settings;
