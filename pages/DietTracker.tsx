
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { Meal, MealType, GlucoseReading } from '../types';
import { getMealInsight } from '../services/geminiService';
import { SparklesIcon } from '../components/shared/Icons';

const MealCard: React.FC<{ meal: Meal }> = ({ meal }) => {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useAppContext();

  const handleGetInsight = async () => {
    setIsLoading(true);
    const recentGlucose = state.glucoseReadings.filter(r => r.timestamp < meal.timestamp);
    const result = await getMealInsight(meal, recentGlucose);
    setInsight(result);
    setIsLoading(false);
  };

  return (
    <Card className="flex flex-col">
      <div className="flex items-start">
        <img src={meal.photoUrl} alt={meal.name} className="w-24 h-24 rounded-lg object-cover mr-4"/>
        <div className="flex-1">
          <p className="font-bold text-lg text-gray-800 dark:text-white">{meal.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{meal.type} &middot; {meal.timestamp.toLocaleString()}</p>
          <p className="font-semibold text-primary-600 dark:text-primary-400">{meal.carbs}g carbs</p>
        </div>
      </div>
      <div className="mt-4">
        {!insight && (
          <button
            onClick={handleGetInsight}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
          >
            {isLoading ? 'Thinking...' : <><SparklesIcon className="w-5 h-5 mr-2"/> Get AI Insight</>}
          </button>
        )}
        {insight && (
          <div className="p-3 bg-primary-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-primary-800 dark:text-primary-200">{insight}</p>
          </div>
        )}
      </div>
    </Card>
  );
};


const DietTracker: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [name, setName] = useState('');
    const [carbs, setCarbs] = useState('');
    const [type, setType] = useState<MealType>(MealType.Lunch);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !carbs) return;

        const newMeal: Meal = {
            id: `m-${new Date().getTime()}`,
            name,
            carbs: parseInt(carbs, 10),
            type,
            timestamp: new Date(),
            photoUrl: `https://picsum.photos/seed/${name.replace(/\s/g, '')}/200/200`
        };

        dispatch({ type: 'ADD_MEAL', payload: newMeal });
        setName('');
        setCarbs('');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Diet Tracker</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Log a New Meal</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="mealName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meal Name</label>
                                <input type="text" id="mealName" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g., Chicken Sandwich" required/>
                            </div>
                            <div>
                                <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Carbs (g)</label>
                                <input type="number" id="carbs" value={carbs} onChange={e => setCarbs(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="35" required/>
                            </div>
                            <div>
                                <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meal Type</label>
                                <select id="mealType" value={type} onChange={e => setType(e.target.value as MealType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                                    {Object.values(MealType).map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Add Meal</button>
                        </form>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recent Meals</h2>
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                        {state.meals.length > 0 ? (
                           // Fix: Explicitly sort meals by timestamp to ensure correct order.
                           state.meals.slice().sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(meal => <MealCard key={meal.id} meal={meal} />)
                        ) : (
                            <Card><p>No meals logged yet.</p></Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DietTracker;