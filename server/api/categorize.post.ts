import { GoogleGenAI } from '@google/genai';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { description } = body;

  if (!description) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Description is required',
    });
  }

  const config = useRuntimeConfig();

  if (!config.geminiApiKey) {
    // Fallback if no API key is provided
    return { category: 'Uncategorized' };
  }

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  try {
    const prompt = `You are the best Finance tracker AI. You should suggest the best and close suitable category for the following transaction description. If ${description} category matches any default then you can suggest that First. If not then suggest the best category. 

    DO NOT RETURN output like: '**Category:** Transport' or **Category:** Food etc. Just return 'Transport' or 'Food' etc.

    Default categories: Food, Transport, Utilities, Entertainment, Housing, Health, Shopping, Other. 

    eg: 1. Uber ride or Ola or Lyft etc => Transport
        2. Coffee or Apple or Chicken Tikka etc => Food
        3. Netflix subscription or Movie or Prime Video etc => Entertainment
        4. Electricity bill or Gas bill or Water bill or Internet bill => Utilities
        5. Groceries or Zomato or Swiggy etc => Food
        6. Rent => Housing
        7. Doctor consultation or Pharmacy => Health
        8. Shopping or Amazon or Flipkart or Myntra etc => Shopping
        9. Other => Other

    Description: ${description}`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: prompt,
      generation_config: {
        thinking_level: "low",
      },
    });

    let category = interaction.output_text?.trim() || 'Other';

    // Remove markdown characters, asterisks, periods, backticks, and newlines
    category = category.replace(/[\n\r*\.`]/g, '').trim();

    // Ensure it matches one of the categories or defaults to Other
    const validCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Housing', 'Health', 'Shopping', 'Other'];

    // Attempt case-insensitive match just in case
    const matchedCategory = validCategories.find(c => c.toLowerCase() === category.toLowerCase());

    return {
      category: matchedCategory ? matchedCategory : 'Other'
    };
  } catch (error) {
    console.error('Error calling Gemini API for categorization:', error);
    return { category: 'Other' };
  }
});
