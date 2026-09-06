const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/v1/chat', async (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "Server missing GEMINI_API_KEY environment variable." });
    }

    const model = req.body.model || "gemini-1.5-flash";
    
    // IMPORTANT: Remove ?key= from the URL for AQ. keys
    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {
        const response = await fetch(googleUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': GEMINI_API_KEY.trim() // Pass key exclusively in header
            },
            body: JSON.stringify({
                systemInstruction: req.body.systemInstruction,
                contents: req.body.contents,
                generationConfig: req.body.generationConfig
            })
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (err) {
        return res.status(500).json({ error: "Failed to connect to Google API", details: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server listening on port ${PORT}`));
