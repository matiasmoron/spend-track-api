import dotenv from 'dotenv';
import OpenAI from 'openai';

// load environment variables from .env file
dotenv.config();

export const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
