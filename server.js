const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());

// Initialize GoogleGenAI with environment variable
const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
const ai = new GoogleGenAI({ apiKey: apiKey });

app.post('/v1/chat', async (req, res) => {
    if (!apiKey) {
        return res.status(500).json({ error: "Server missing GEMINI_API_KEY environment variable." });
    }

    try {
        const modelName = req.body.model || 'gemini-1.5-flash';
        
        // Extract system prompt and user history sent from Roblox
        const systemInstruction = req.body.systemInstruction?.parts?.[0]?.text || '';
        const contents = req.body.contents || [];

        // Call Gemini using official SDK native handling
        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: req.body.generationConfig?.temperature || 0.85,
                maxOutputTokens: req.body.generationConfig?.maxOutputTokens || 180,
            }
        });

        // Return standard response structure back to Roblox
        return res.status(200).json({
            candidates: [
                {
                    content: {
                        parts: [{ text: response.text }]
                    }
                }
            ]
        });

    } catch (err) {
        console.error("Gemini API Error:", err);
        return res.status(500).json({ 
            error: "Failed to connect to Google API", 
            details: err.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server listening on port ${PORT}`));
