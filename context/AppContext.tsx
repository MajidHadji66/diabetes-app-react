
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, Meal, Exercise, JournalEntry, Settings, MealType, JournalTag, GlucoseReading, Medication, Action } from '../types';

// --- Mock Data Generation ---
const now = new Date();
const generateGlucoseData = (days: number): GlucoseReading[] => {
  const data: GlucoseReading[] = [];
  const startTime = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  let currentTime = startTime.getTime();
  let currentGlucose = 110;

  while (currentTime < now.getTime()) {
    const timestamp = new Date(currentTime);
    const hour = timestamp.getHours();

    // Simulate meal spikes
    if ([8, 13, 19].includes(hour)) {
      currentGlucose += Math.random() * 40 + 20;
    }
    // Simulate exercise dips
    else if ([10, 17].includes(hour)) {
      currentGlucose -= Math.random() * 20 + 10;
    }
    // Gradual return to baseline
    else {
      if (currentGlucose > 100) {
        currentGlucose -= Math.random() * 5;
      } else {
        currentGlucose += Math.random() * 3;
      }
    }

    // Add natural variance
    currentGlucose += (Math.random() - 0.5) * 8;

    // Clamp values
    currentGlucose = Math.max(50, Math.min(250, currentGlucose));

    data.push({
      id: `g-${currentTime}`,
      value: Math.round(currentGlucose),
      timestamp: timestamp,
    });

    currentTime += 5 * 60 * 1000; // 5-minute intervals
  }
  return data;
};

const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

const initialState: AppState = {
  glucoseReadings: generateGlucoseData(3),
  meals: [
    { id: 'm1', name: 'Oatmeal with Berries', carbs: 50, type: MealType.Breakfast, timestamp: new Date(new Date().setHours(8, 15, 0, 0)), photoUrl: `https://picsum.photos/seed/Oatmeal/200/200` },
    { id: 'm2', name: 'Grilled Chicken Salad', carbs: 20, type: MealType.Lunch, timestamp: new Date(new Date().setHours(13, 5, 0, 0)), photoUrl: `https://picsum.photos/seed/Salad/200/200` },
    { id: 'm3', name: 'Apple with Peanut Butter', carbs: 30, type: MealType.Snack, timestamp: new Date(new Date().setHours(16, 30, 0, 0)), photoUrl: `https://picsum.photos/seed/Apple/200/200` },
    { id: 'm4', name: 'Salmon and Quinoa', carbs: 60, type: MealType.Dinner, timestamp: new Date(yesterday.setHours(19, 0, 0, 0)), photoUrl: `https://picsum.photos/seed/Salmon/200/200` }
  ],
  exercises: [
    { id: 'e1', type: 'Morning Walk', duration: 30, timestamp: new Date(new Date().setHours(7, 0, 0, 0)) },
    { id: 'e2', type: 'Weight Lifting', duration: 45, timestamp: new Date(yesterday.setHours(17, 30, 0, 0)) },
  ],
  journalEntries: [
    { id: 'j1', notes: 'Felt great after my morning walk. Glucose levels were stable all morning.', mood: 5, tag: JournalTag.GoodControl, timestamp: new Date(new Date().setHours(11, 0, 0, 0)) },
    { id: 'j2', notes: 'Ate a bit too much pasta for dinner and saw a big spike. Need to be more careful with portion sizes.', mood: 2, tag: JournalTag.SlipUp, timestamp: new Date(yesterday.setHours(21, 0, 0, 0)) }
  ],
  medications: [
    { id: 'med1', name: 'Metformin', dosage: '500mg', time: '08:00', reminderEnabled: true },
    { id: 'med2', name: 'Lisinopril', dosage: '10mg', time: '09:00', reminderEnabled: true },
    { id: 'med3', name: 'Metformin', dosage: '500mg', time: '20:00', reminderEnabled: false },
  ],
  settings: {
    theme: 'light',
    glucoseTargetRange: { min: 70, max: 180 },
    glucoseAlertLevels: { low: 65, high: 200 },
  },
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_MEAL':
      return { ...state, meals: [action.payload, ...state.meals] };
    case 'ADD_EXERCISE':
      return { ...state, exercises: [action.payload, ...state.exercises] };
    case 'ADD_JOURNAL_ENTRY':
      return { ...state, journalEntries: [action.payload, ...state.journalEntries] };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case 'ADD_MEDICATION':
      return {
        ...state,
        medications: [...state.medications, action.payload].sort((a, b) => a.time.localeCompare(b.time)),
      };
    case 'REMOVE_MEDICATION':
      return {
        ...state,
        medications: state.medications.filter(m => m.id !== action.payload.id),
      };
    case 'TOGGLE_MEDICATION_REMINDER':
      return {
        ...state,
        medications: state.medications.map(m =>
          m.id === action.payload.id ? { ...m, reminderEnabled: !m.reminderEnabled } : m
        ),
      };
    case 'IMPORT_DATA':
      const { glucoseReadings, meals, exercises } = action.payload;
      return {
        ...state,
        glucoseReadings: [...state.glucoseReadings, ...glucoseReadings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
        meals: [...state.meals, ...meals].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
        exercises: [...state.exercises, ...exercises].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
      };
    case 'REPLACE_GLUCOSE_READINGS':
      return {
        ...state,
        glucoseReadings: action.payload.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
      };
    default:
      return state;
  }
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Here you could persist state to localStorage if desired
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// --- Dexcom Helpers ---
export const useDexcom = () => {
  const { state, dispatch } = useAppContext();

  const connect = async (username, password, region) => {
    try {
      const res = await fetch('/api/dexcom/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, region })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Dexcom connect response parse error. Raw text:", text);
        return { success: false, error: "Server Error: Unexpected response format" };
      }

      if (data.success) {
        localStorage.setItem('dexcomSessionId', data.sessionId);
        localStorage.setItem('dexcomRegion', region);
        if (data.username) localStorage.setItem('dexcomUsername', data.username);
        if (data.accountId) localStorage.setItem('dexcomAccountId', data.accountId);

        dispatch({
          type: 'UPDATE_SETTINGS',
          payload: {
            dexcom: {
              connected: true,
              region,
              lastSync: new Date(),
              username: data.username,
              accountId: data.accountId
            }
          }
        });
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const sync = async () => {
    const sessionId = localStorage.getItem('dexcomSessionId');
    const region = localStorage.getItem('dexcomRegion') || 'US';

    if (!sessionId) return;

    try {
      const res = await fetch('/api/dexcom/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, region })
      });

      if (res.ok) {
        const readings = await res.json();
        // Merge readings? Or replace?
        // For now, let's just append new ones that don't exist
        if (readings.length > 0) {
          // We need a specific action to merge verified data
          // converting date strings back to objects if needed
          const parsedReadings = readings.map(r => ({
            ...r,
            timestamp: new Date(r.timestamp)
          }));

          // REPLACE existing mock data with real data
          dispatch({
            type: 'REPLACE_GLUCOSE_READINGS',
            payload: parsedReadings
          });

          dispatch({
            type: 'UPDATE_SETTINGS',
            payload: {
              dexcom: { connected: true, region, lastSync: new Date() }
            }
          });
        }
      } else {
        // If 401/error, maybe session expired
        if (res.status === 500) { // Check specific error text if possible
          // assume session invalid
        }
      }
    } catch (error) {
      console.error("Dexcom Sync failed", error);
    }
  };

  return { connect, sync };
};
