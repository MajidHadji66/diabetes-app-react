
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { JournalEntry, JournalTag } from '../types';

const Journal: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [notes, setNotes] = useState('');
    const [mood, setMood] = useState(3);
    const [tag, setTag] = useState<JournalTag | undefined>(undefined);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!notes) return;

        const newEntry: JournalEntry = {
            id: `j-${new Date().getTime()}`,
            notes,
            mood,
            tag,
            timestamp: new Date()
        };

        dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: newEntry });
        setNotes('');
        setMood(3);
        setTag(undefined);
    };
    
    const moods = [
      { value: 1, emoji: '😞', label: 'Very Bad' },
      { value: 2, emoji: '😕', label: 'Bad' },
      { value: 3, emoji: '😐', label: 'Okay' },
      { value: 4, emoji: '🙂', label: 'Good' },
      { value: 5, emoji: '😄', label: 'Very Good' },
    ];
    
    const getTagColor = (tagValue?: JournalTag) => {
        switch(tagValue) {
            case JournalTag.GoodControl: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case JournalTag.Learning: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case JournalTag.SlipUp: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Behavioral Journal</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">New Reflection</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">How was your day?</label>
                                <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="What went well? What could be better?" required></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Overall Mood</label>
                                <div className="flex justify-around items-center">
                                    {moods.map(m => (
                                        <button type="button" key={m.value} onClick={() => setMood(m.value)} className={`p-2 rounded-full transition-transform transform hover:scale-125 ${mood === m.value ? 'bg-primary-100 dark:bg-primary-800 scale-125' : ''}`}>
                                            <span className="text-3xl">{m.emoji}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tag your day</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(JournalTag).map(t => (
                                        <button type="button" key={t} onClick={() => setTag(t)} className={`px-3 py-1 text-sm font-semibold rounded-full ${tag === t ? 'ring-2 ring-primary-500' : ''} ${getTagColor(t)}`}>{t}</button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">Save Entry</button>
                        </form>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Past Entries</h2>
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                        {state.journalEntries.length > 0 ? (
                           // Fix: Explicitly sort journal entries by timestamp to ensure correct order.
                           state.journalEntries.slice().sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(entry => (
                            <Card key={entry.id}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-300">{entry.notes}</p>
                                    </div>
                                    <span className="text-3xl">{moods.find(m => m.value === entry.mood)?.emoji}</span>
                                </div>
                                <div className="flex justify-between items-end mt-4">
                                    {entry.tag && <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTagColor(entry.tag)}`}>{entry.tag}</span>}
                                    <p className="text-xs text-gray-400 dark:text-gray-500 text-right">{entry.timestamp.toLocaleDateString()}</p>
                                </div>
                            </Card>
                           ))
                        ) : (
                            <Card><p>No journal entries yet.</p></Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Journal;