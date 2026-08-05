import { GoogleGenAI } from '@google/genai';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { message, expenses, history } = body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message is required',
    });
  }

  const config = useRuntimeConfig();

  if (!config.geminiApiKey) {
    return {
      reply: "I'm sorry, the AI assistant isn't configured yet. Please set GEMINI_API_KEY in your environment to enable me. Keep tracking your expenses in the meantime!",
    };
  }

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  // Compact expense snapshot to save tokens
  const expenseData = (expenses || []).slice(0, 200).map((e) => ({
    amount: e.amount,
    category: e.category,
    date: e.date,
    description: e.description,
  }));

  const systemPrompt = [
    'You are FinanceAI, the built-in AI assistant for the "AI Finance Tracker" app - a personal expense tracking application.',
    'Your ONLY job is to help the user understand and manage their own expenses, spending, budgets, and savings as tracked in this app.',
    '',
    'STRICT RULES:',
    '1. Answer ONLY questions related to the user\'s expense data provided below, or questions about using the AI Finance Tracker app itself.',
    '2. If the user asks anything UNRELATED to expenses or the app - such as general knowledge, current events, politics, sports, weather, entertainment, news, science, "who is the president", "what is the weather in India", etc. - you MUST politely refuse and redirect them. Reply with something like: "I\'m FinanceAI, your personal finance assistant in AI Finance Tracker. I can only help with questions about your expenses and spending habits. 😊 Try asking about your spending or savings!"',
    '3. Base every answer on the user\'s expense data. If the data does not contain what they ask about, say so and suggest they log more expenses.',
    '4. Never invent expenses, numbers, or facts that are not present in the data provided.',
    '5. Be concise, friendly, and helpful. Use short bullet points when it improves clarity.',
    '',
    'USER\'S EXPENSES:',
    JSON.stringify(expenseData),
  ].join('\n');

  // Include a short recent conversation so follow-up questions make sense
  const recentHistory = (history || [])
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const prompt = [
    systemPrompt,
    '',
    recentHistory ? `RECENT CONVERSATION:\n${recentHistory}\n` : '',
    `User's question: ${message}`,
    '',
    'Reply as FinanceAI:',
  ].join('\n');

  try {
    const interaction = await ai.interactions.create({
      model: 'gemini-3.6-flash',
      input: prompt,
      generation_config: {
        thinking_level: 'low',
      },
    });

    let reply = interaction.output_text || '';

    // Clean up markdown / JSON wrappers if present
    reply = reply.replace(/```json/g, '').replace(/```/g, '').trim();

    if (!reply) {
      reply = "I couldn't generate a response right now. Please try again!";
    }

    return { reply };
  } catch (error) {
    console.error('Error calling Gemini API for chat:', error);
    return {
      reply: "Oops! I ran into a hiccup connecting to my AI brain. Please try again in a moment.",
    };
  }
});
