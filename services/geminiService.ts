
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

export const getSmartProductInsight = async (_product: Product): Promise<string> => {
  return "";
};

export const searchProductsSmartly = async (query: string, allProducts: Product[]): Promise<string[]> => {
  // Initialize only when called to prevent top-level crashes if process.env is missing
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found, falling back to basic search.");
    return allProducts
      .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
      .map(p => p.id);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Given the query "${query}", return a JSON array of IDs for the most relevant products from: ${JSON.stringify(allProducts.map(p => ({id: p.id, name: p.name})))}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Search error:", error);
    return allProducts
      .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
      .map(p => p.id);
  }
};
