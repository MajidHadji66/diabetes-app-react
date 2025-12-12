import { Meal, GlucoseReading } from "../types";

export const getMealInsight = async (
  meal: Meal,
  recentGlucose: GlucoseReading[]
): Promise<string> => {
  const recentReadings = recentGlucose
    .slice(-5)
    .map((r) => `${r.value} mg/dL at ${r.timestamp.toLocaleTimeString()}`)
    .join(", ");

  const prompt = `
    As an expert on Type 2 Diabetes management, provide a brief, encouraging, and helpful insight.
    A user just logged a meal.
    
    Meal Details:
    - Name: ${meal.name}
    - Type: ${meal.type}
    - Estimated Carbs: ${meal.carbs}g

    User's Glucose Before Meal (last few readings): ${recentReadings || "No recent data"
    }

    Based on this, what is a likely short-term impact on their blood sugar, and what's a simple, actionable tip?
    Keep the response concise, friendly, and under 50 words. Focus on empowerment, not criticism.
    Example: "With ${meal.carbs
    }g of carbs, you might see a moderate rise. A short 15-minute walk in about an hour can make a big difference. Great job logging your meal!"
    `;

  try {
    const response = await fetch('/api/insight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error fetching meal insight from backend:", error);
    return "Could not retrieve AI insight at this time. Please try again later.";
  }
};
