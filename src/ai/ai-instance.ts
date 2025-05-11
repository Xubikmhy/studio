'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Ensure that the GOOGLE_GENAI_API_KEY is available in the environment.
// For server-side execution (like Genkit flows), this might be from .env or server environment variables.
// For client-side calls that trigger server actions, the server action environment will have access.

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.warn(
    'GOOGLE_GENAI_API_KEY is not set. Genkit AI features may not work.'
  );
}

export const ai = genkit({
  // Genkit expects prompts to be in a 'prompts' directory relative to where it's run,
  // or specify an absolute path. If flows are in `src/ai/flows` and `ai-instance` is in `src/ai`,
  // and assuming `genkit start` is run from project root, this might need adjustment
  // if prompts are stored elsewhere or not used directly by file path.
  // For definePrompt, promptDir is not strictly necessary if prompts are defined inline.
  // promptDir: './src/ai/prompts', // Example if you had a prompts folder here.
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY, // This is correct for passing the API key
    }),
  ],
  // model: 'googleai/gemini-2.0-flash', // Default model, can be overridden in specific calls
  // It's generally better to specify the model in each ai.generate or ai.definePrompt call for clarity.
});
