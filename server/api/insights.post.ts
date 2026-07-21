import { GoogleGenAI } from '@google/genai';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { expenses } = body;

  if (!expenses || !Array.isArray(expenses)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Expenses array is required',
    });
  }

  const config = useRuntimeConfig();

  if (!config.geminiApiKey) {
    return {
      insights: {
        summary: "API Key not configured. Please set GEMINI_API_KEY to receive AI insights.",
        advice: "Track your expenses carefully."
      }
    };
  }

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  try {
    // Summarize data to save tokens
    const expenseData = expenses.map(e => ({
      amount: e.amount,
      category: e.category,
      date: e.date
    }));

    const prompt = `Analyze these recent expenses for a user. Provide two things in JSON format:
    1. "summary": A brief, friendly summary (1-2 sentences) of their spending habits based on this data.
    2. "advice": A specific piece of financial advice or observation.
    
    Expenses: ${JSON.stringify(expenseData)}
    
    Output strictly as JSON in the format: {"summary": "...", "advice": "..."}`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: prompt,
      generation_config: {
        thinking_level: "low",
      },
    });

    let responseText = interaction.output_text || '{}';
    // Remove markdown json wrappers if present
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(responseText);
      return { insights: parsed };
    } catch (parseError) {
      console.error('Failed to parse AI JSON response:', parseError);
      return {
        insights: {
          summary: "We analyzed your expenses but couldn't format the response properly.",
          advice: responseText
        }
      };
    }
  } catch (error) {
    console.error('Error calling Gemini API for insights:', error);
    return {
      insights: {
        summary: "We couldn't generate insights at this time.",
        advice: "Keep up the good work tracking your expenses!"
      }
    };
  }
});
