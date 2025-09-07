import { GoogleGenAI, Type as GeminiType } from "@google/genai";
import { GEMINI_API_KEY_B64, ZHIPU_API_KEY_B64 } from '../apiKey';
import type { ModelProvider } from '../types';

let geminiAi: GoogleGenAI | null = null;
let zhipuApiKey: string | null = null;

// --- Singleton Initializers ---
const getGemini = (): GoogleGenAI | null => {
    if (!geminiAi) {
        try {
            const geminiKey = atob(GEMINI_API_KEY_B64);
            geminiAi = new GoogleGenAI({ apiKey: geminiKey });
        } catch (e) { console.error("Failed to initialize Gemini AI:", e); }
    }
    return geminiAi;
}
const getZhipuKey = (): string | null => {
    if (!zhipuApiKey) {
         try { zhipuApiKey = atob(ZHIPU_API_KEY_B64); } catch (e) { console.error("Failed to decode Zhipu API key:", e); }
    }
    return zhipuApiKey;
}

// This function is called once in App.tsx to ensure keys are decoded early.
export const initializeAiService = () => {
    getGemini();
    getZhipuKey();
};

// --- Provider Management ---
const AI_PROVIDER_KEY = 'ai_model_provider';

export const setAiProvider = (provider: ModelProvider): void => {
    try {
        localStorage.setItem(AI_PROVIDER_KEY, provider);
    } catch (e) { console.error("Failed to set AI provider in localStorage", e); }
};

export const getAiProvider = (): ModelProvider => {
    try {
        const provider = localStorage.getItem(AI_PROVIDER_KEY);
        if (provider === 'gemini' || provider === 'zhipu') {
            return provider;
        }
    } catch (e) { console.error("Failed to get AI provider from localStorage", e); }
    return 'gemini'; // Default provider
};


// --- Unified API Callers ---

interface GenerateContentConfig {
    prompt: string;
    jsonSchema?: any; // Gemini's schema format
}

export const generateContent = async (config: GenerateContentConfig): Promise<string> => {
    const provider = getAiProvider();
    
    if (provider === 'zhipu') {
        const apiKey = getZhipuKey();
        if (!apiKey) throw new Error("Zhipu AI key is not available.");

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        };
        const body: any = {
            model: 'glm-4.5-flash',
            messages: [{ role: 'user', content: config.prompt }],
            thinking: { type: 'enabled' },
            temperature: 0.7
        };

        if (config.jsonSchema) {
            body.response_format = { type: 'json_object' };
        }
        
        const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Zhipu API Error:", errorBody);
            throw new Error(`Zhipu API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.choices[0].message.content;

    } else { // Default to Gemini
        const ai = getGemini();
        if (!ai) throw new Error("Gemini AI is not initialized.");
        
        const geminiConfig: any = {};
        if (config.jsonSchema) {
            geminiConfig.responseMimeType = "application/json";
            geminiConfig.responseSchema = config.jsonSchema;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: config.prompt,
            config: geminiConfig,
        });
        return response.text;
    }
};

export async function* generateContentStream(prompt: string): AsyncGenerator<string> {
    const provider = getAiProvider();

    if (provider === 'zhipu') {
        const apiKey = getZhipuKey();
        if (!apiKey) throw new Error("Zhipu AI key is not available.");

        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
        const body = {
            model: 'glm-4.5-flash',
            messages: [{ role: 'user', content: prompt }],
            thinking: { type: 'enabled' },
            stream: true,
        };
        const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok || !response.body) {
            throw new Error(`Zhipu API stream error: ${response.statusText}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last, potentially incomplete line

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.substring(6);
                    if (jsonStr.trim() === '[DONE]') {
                        return;
                    }
                    try {
                        const data = JSON.parse(jsonStr);
                        if (data.choices && data.choices[0].delta.content) {
                            yield data.choices[0].delta.content;
                        }
                    } catch (e) {
                        // Ignore parsing errors for incomplete JSON chunks
                    }
                }
            }
        }

    } else { // Default to Gemini
        const ai = getGemini();
        if (!ai) throw new Error("Gemini AI is not initialized.");
        
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (chunkText) {
                yield chunkText;
            }
        }
    }
}