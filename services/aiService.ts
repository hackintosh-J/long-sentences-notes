// This file is responsible for communicating with the AI APIs (Gemini and Zhipu).
// It abstracts the specific API calls so other components don't need to know the details.

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
            console.log('[AI Service] Initializing Gemini.');
            geminiAi = new GoogleGenAI({ apiKey: geminiKey });
        } catch (e) { console.error("Failed to initialize Gemini AI:", e); }
    }
    return geminiAi;
}
const getZhipuKey = (): string | null => {
    if (!zhipuApiKey) {
         try { 
            zhipuApiKey = atob(ZHIPU_API_KEY_B64);
            console.log('[AI Service] Initializing Zhipu.');
        } catch (e) { console.error("Failed to decode Zhipu API key:", e); }
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
    return 'zhipu'; // Default provider
};


// --- Unified API Callers ---

interface GenerateContentConfig {
    prompt: string;
    jsonSchema?: any; // Gemini's schema format
    timeout?: number;
}

export const generateContent = async (config: GenerateContentConfig): Promise<string> => {
    const provider = getAiProvider();
    const timeout = config.timeout ?? 20000; // Default to 20 seconds
    console.log(`[AI Service] generateContent called. Provider: ${provider}, Timeout: ${timeout}ms`, { config });
    
    if (provider === 'zhipu') {
        const apiKey = getZhipuKey();
        if (!apiKey) throw new Error("Zhipu AI key is not available.");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            };
            const body: any = {
                // FIX: Switched to the more cost-effective 'glm-4.5-flash' model for non-streaming tasks
                // to prevent "insufficient balance" errors on simple JSON formatting jobs.
                model: 'glm-4.5-flash',
                messages: [{ role: 'user', content: config.prompt }],
                temperature: 0.7
            };

            if (config.jsonSchema) {
                body.response_format = { type: 'json_object' };
            }

            const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
                signal: controller.signal
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("[AI Service] Zhipu API Error Response Body:", errorBody);
                throw new Error(`Zhipu API error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error(`[AI Service] Zhipu generateContent Error:`, error);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('timeout');
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }

    } else { // Gemini
        const ai = getGemini();
        if (!ai) throw new Error("Gemini AI is not initialized.");

        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeout)
        );
        
        const geminiConfig: any = {
            temperature: 0.8,
        };
        if (config.jsonSchema) {
            geminiConfig.responseMimeType = "application/json";
            geminiConfig.responseSchema = config.jsonSchema;
        }

        const requestPayload = {
            model: 'gemini-2.5-flash',
            contents: config.prompt,
            config: geminiConfig,
        };

        try {
            const generationPromise = ai.models.generateContent(requestPayload);
            const response = await Promise.race([generationPromise, timeoutPromise]);
            return response.text;
        } catch (error) {
            console.error(`[AI Service] Gemini generateContent Error:`, error);
            if (error instanceof Error && error.message === 'timeout') {
                throw new Error('timeout');
            }
            throw error;
        }
    }
};

export type StreamChunk = {
    type: 'thinking' | 'content';
    content: string;
};

export type StreamOutput = {
    parsed: StreamChunk | null;
    raw: string;
};

export async function* generateContentStream(prompt: string, timeout?: number, jsonSchema?: any): AsyncGenerator<StreamOutput> {
    const provider = getAiProvider();
    const effectiveTimeout = timeout ?? 20000;
    console.log(`[AI Service] generateContentStream called. Provider: ${provider}, Timeout: ${effectiveTimeout}ms`, { prompt });

    if (provider === 'zhipu') {
        const apiKey = getZhipuKey();
        if (!apiKey) throw new Error("Zhipu AI key is not available.");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.warn(`[AI Service] Zhipu stream request timed out after ${effectiveTimeout}ms.`);
            controller.abort();
        }, effectiveTimeout);
        
        let firstTokenReceived = false;

        try {
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
            const body: any = {
                model: 'glm-4.5-flash',
                messages: [{ role: 'user', content: prompt }],
                stream: true,
                meta: { "enable_think": true },
                temperature: 0.7,
            };
            // FIX: Removed conditional JSON format for streaming. It was causing the thinking chain to be disabled.
            // The prompt has been reinforced to handle JSON output instead.
            // if (jsonSchema) {
            //     body.response_format = { type: 'json_object' };
            // }
            const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
                signal: controller.signal
            });

            if (!response.ok || !response.body) {
                const errorBody = await response.text();
                console.error("[AI Service] Zhipu Stream API Error Response Body:", errorBody);
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
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.substring(6).trim();
                        yield { parsed: null, raw: jsonStr };

                        if (jsonStr === '[DONE]') {
                            return;
                        }
                        try {
                            const data = JSON.parse(jsonStr);
                            const choice = data.choices?.[0];
                            let chunkToYield: StreamChunk | null = null;
                            
                            if (choice?.delta) {
                                if (choice.delta.reasoning_content) {
                                    chunkToYield = { type: 'thinking', content: choice.delta.reasoning_content };
                                } else if (choice.delta.content) {
                                    chunkToYield = { type: 'content', content: choice.delta.content };
                                }
                            }

                            if (chunkToYield) {
                                if (!firstTokenReceived) {
                                    clearTimeout(timeoutId);
                                    firstTokenReceived = true;
                                }
                                yield { parsed: chunkToYield, raw: '' };
                            }

                        } catch (e) {
                             console.warn('[AI Service] Zhipu Stream JSON parsing error:', jsonStr);
                        }
                    }
                }
            }
        } catch(error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('timeout');
            }
            throw error;
        } finally {
            if (!firstTokenReceived) {
                clearTimeout(timeoutId);
            }
        }

    } else { // Default to Gemini
        const ai = getGemini();
        if (!ai) throw new Error("Gemini AI is not initialized.");
        
        const geminiConfig: any = {
            temperature: 0.8,
        };
        if (jsonSchema) {
            geminiConfig.responseMimeType = "application/json";
            geminiConfig.responseSchema = jsonSchema;
        }

        const requestPayload = {
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: geminiConfig,
        };
        
        try {
            const responseStream = await ai.models.generateContentStream(requestPayload);
            for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    const parsedChunk: StreamChunk = { type: 'content', content: chunkText };
                    yield { parsed: parsedChunk, raw: chunkText };
                }
            }
        } catch(error) {
            console.error('[AI Service] Gemini generateContentStream Error:', error);
            throw error;
        }
    }
}