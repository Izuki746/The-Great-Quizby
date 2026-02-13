
import { GoogleGenAI, Type } from "@google/genai";
import { QuizConfig, Question } from "../types";

// Initialize Gemini Client strictly for frontend-side usage
// The API key is assumed to be available in process.env.API_KEY via Vite injection
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuizQuestions = async (config: QuizConfig): Promise<Question[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a professional academic multiple-choice quiz about "${config.topic}". 
                 The target audience is at the ${config.difficulty} level. 
                 Generate exactly ${config.questionCount} high-quality questions.`,
      config: {
        systemInstruction: "You are an expert academic assessment creator. Your quizzes are challenging, accurate, and educational.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { 
                type: Type.STRING,
                description: "The clear and concise question text."
              },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 4 options for the multiple choice question."
              },
              correctAnswer: { 
                type: Type.STRING, 
                description: "The exact text of the correct option." 
              },
              explanation: { 
                type: Type.STRING,
                description: "A brief explanation of why the answer is correct."
              }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as Question[];
    } else {
      throw new Error("Empty response from AI engine.");
    }

  } catch (error) {
    console.error("AI Generation failed, using safety fallback:", error);
    // Safety fallback for UI consistency during development or quota limits
    return [
      {
        question: "Which architectural principle focuses on creating a consistent look across different UI components?",
        options: ["Atomic Design", "Responsive Web Design", "Glassmorphism", "Design Systems"],
        correctAnswer: "Design Systems",
        explanation: "A Design System is a collection of reusable components and clear standards that can be assembled together to build any number of applications."
      },
      {
        question: "In React, which hook is primarily used for side effects like API calls?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correctAnswer: "useEffect",
        explanation: "The useEffect Hook allows you to perform side effects in functional components."
      }
    ];
  }
};
