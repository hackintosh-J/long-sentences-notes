export type AnnotationType = 'vocabulary' | 'grammar' | 'phrase' | 'reference';

export interface Annotation {
  text: string;
  explanation: string;
  type: AnnotationType;
}

export interface SentenceData {
  id: number;
  sentence: string;
  annotations: Annotation[];
  fullTranslation: string;
}

// Quiz Type
export interface QuizQuestion {
    question: string;
    options: string[];
    answerIndex: number; // Index of the correct option
    explanation: string;
}

export interface Quiz {
    questions: QuizQuestion[];
}


// Politics Types
export interface PoliticsCardData {
    id: string;
    term: string;
    explanation: string;
    details?: string[];
}

export interface PoliticsTopic {
    id: string;
    title: string;
    cards: PoliticsCardData[];
    quiz: Quiz;
}

// Medicine - Metabolic Calculator Types

export type Substrate = 'glucose' | 'glycogen' | 'palmitic_acid';

export interface SubstrateInfo {
    id: Substrate;
    name: string;
    formula?: string;
}

export interface CalculationStep {
    title: string;
    nadh: number;
    fadh2: number;
    atp_gtp: number;
    details: string;
}

export interface MetabolicPathway {
    id: string;
    substrate: Substrate;
    condition: 'aerobic' | 'anaerobic';
    name: string;
    description: string;
    steps: CalculationStep[];
    oxygen_needed_per_mol?: (n: number) => number; // n is for carbon count, for fatty acids
    co2_produced_per_mol?: (n: number) => number; // n is for carbon count
    final_note: string;
}

// App Page Type
export type Page = 'dashboard' | 'english' | 'politics' | 'medicine' | 'focus_garden' | 'mood_journal' | 'ai_assistant' | 'study_analysis';


// Mood Journal Types
export type Mood = 1 | 2 | 3 | 4 | 5; // 1: Awful, 5: Great

export interface MoodEntry {
    date: string; // YYYY-MM-DD
    mood: Mood;
    text: string;
}