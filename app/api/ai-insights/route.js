import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
    try {
        const { transactions } = await request.json();

        if (!transactions || transactions.length === 0) {
            return NextResponse.json({
                success: true,
                insights: "No transactions available to analyze. Please add some transactions to get insights.",
            });
        }

        const prompt = `
            You are a smart financial advisor. Here is a user's recent financial transactions list (JSON format):
            ${JSON.stringify(transactions)}

            Analyze these transactions and provide 3 short, practical, and friendly financial recommendations in English language to help the user save money and manage their budget better. 
            CRITICAL INSTRUCTIONS: 
            1. Do NOT use any markdown symbols, asterisks (*), bold (**), or hashes (#) under any circumstances.
            2. Output strictly in clean, plain text.
            3. Use clear spacing or simple numbers (1., 2., 3.) for the points.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
        });

        const textResponse = response.text || "No insights generated.";

        return NextResponse.json({ success: true, insights: textResponse });
    } catch (error) {
        console.error("AI Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}