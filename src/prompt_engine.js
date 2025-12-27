/**
 * prompt_engine.js
 * Logic to transform boring user concepts into sticky, memorable imagery.
 * Based on the "Guy Fieri Hairbrush" principle.
 */

const MODIFIERS = [
    "surrealist art style",
    "made of melting clocks",
    "neon cyberpunk color palette",
    "on fire",
    "covered in glitter and slime",
    "hyper-realistic texture",
    "floating in zero gravity",
    "made of crystal glass",
    "wearing a tiny tuxedo"
];

async function enhancePrompt(userConcept, apiKey = null) {
    // Select a random modifier to enforce novelty
    const randomMod = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    
    const instruction = `
        Create a vivid, absurd, and highly memorable description of the following concept: "${userConcept}".
        
        Guidelines:
        1. The object should be central and clear.
        2. Apply this visual style/modification: ${randomMod}.
        3. Make it weird. If it's a boring object, give it a personality or a strange texture.
        4. Describe it in 1-2 punchy sentences.
    `;

    // 1. If API Key exists, call Gemini
    if (apiKey) {
        try {
            console.log("🤖 Calling Gemini API...");
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: instruction }] }]
                })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            }
            console.warn("Gemini response unexpected:", data);
        } catch (err) {
            console.error("Gemini API failed, falling back to local engine.", err);
        }
    }

    // 2. Fallback: Local Engineered Prompt String
    return `[Local Engine] Description: ${userConcept} but ${randomMod}. (Add API Key in Settings for real AI)`;
}

export { enhancePrompt };
