import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getRecipeRecommendation(prompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful cooking assistant that provides detailed recipes with ingredients and instructions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error getting recipe recommendation:', error);
    throw error;
  }
}

export async function getRecipeModification(recipe: string, modification: string) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful cooking assistant that provides recipe modifications while maintaining the original recipe's essence."
        },
        {
          role: "user",
          content: `Original recipe: ${recipe}\nRequested modification: ${modification}`
        }
      ],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error modifying recipe:', error);
    throw error;
  }
} 