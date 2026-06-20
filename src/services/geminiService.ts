import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const geminiService = {
  async predictMaintenance(assets: any[], maintenanceHistory: any[]) {
    const prompt = `
      You are an expert Asset Maintenance bot. 
      Analyze the following fleet of assets and their maintenance history.
      Suggest the next 3 priority maintenance actions.
      
      Assets: ${JSON.stringify(assets.map(a => ({ id: a.id, name: a.name, category: a.category, purchaseDate: a.purchaseDate, status: a.status })))}
      History: ${JSON.stringify(maintenanceHistory.map(m => ({ assetId: m.assetId, date: m.date, type: m.type })))}
      
      Return a JSON array of objects with fields: assetName, predictedIssue, recommendation, priority (High/Medium).
      Respond ONLY with the JSON array.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error("AI Prediction failed", error);
      return [];
    }
  },

  async generateAssetDescription(asset: any) {
    const prompt = `Generate a 1-sentence technical description for this asset: ${JSON.stringify(asset)}. Focus on its typical use case in a corporate environment.`;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      return response.text;
    } catch (error) {
      return "Technical asset optimized for organization workflow.";
    }
  },

  async getSystemHealthSummary(assets: any[], maintenance: any[]) {
    const prompt = `
      You are a CTO analyzing your company's IT asset health.
      Assets Data: ${JSON.stringify(assets.map(a => ({ name: a.name, category: a.category, status: a.status, condition: a.condition })))}
      Maintenance Data: ${JSON.stringify(maintenance.map(m => ({ type: m.type, cost: m.cost })))}

      Write a concise 2-sentence executive summary of the overall system health. 
      Identify one positive trend and one area for urgent attention.
      Be direct and professional.
    `;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      return response.text;
    } catch (error) {
      return "System diagnostics suggest stable operations with routine maintenance scheduled.";
    }
  }
};
