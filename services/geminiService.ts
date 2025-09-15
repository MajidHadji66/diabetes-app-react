import { GoogleGenAI } from "@google/genai";
import { Meal, GlucoseReading } from "../types";

// Fix: Initialize GoogleGenAI client according to guidelines, assuming API_KEY is set.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getMealInsight = async (meal: Meal, recentGlucose: GlucoseReading[]): Promise<string> => {
    // Fix: Removed redundant API key check.
  const recentReadings = recentGlucose
    .slice(-5)
    .map(r => `${r.value} mg/dL at ${r.timestamp.toLocaleTimeString()}`)
    .join(', ');

  const prompt = `
    As an expert on Type 2 Diabetes management, provide a brief, encouraging, and helpful insight.
    A user just logged a meal.
    
    Meal Details:
    - Name: ${meal.name}
    - Type: ${meal.type}
    - Estimated Carbs: ${meal.carbs}g

    User's Glucose Before Meal (last few readings): ${recentReadings || 'No recent data'}

    Based on this, what is a likely short-term impact on their blood sugar, and what's a simple, actionable tip?
    Keep the response concise, friendly, and under 50 words. Focus on empowerment, not criticism.
    Example: "With ${meal.carbs}g of carbs, you might see a moderate rise. A short 15-minute walk in about an hour can make a big difference. Great job logging your meal!"
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching meal insight from Gemini:", error);
    return "Could not retrieve AI insight at this time. Please try again later.";
  }
};
