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

function enhancePrompt(userConcept, context = "general") {
    // Select a random modifier to enforce novelty
    const randomMod = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    
    // Structure the prompt for the AI (Gemini)
    // We explicitly ask for "Memorable" and "Distinct" features.
    const engineeredPrompt = `
        Create a vivid, absurd, and highly memorable image of the following concept: "${userConcept}".
        
        Guidelines for the image:
        1. The object should be central and clear.
        2. Apply this visual style/modification: ${randomMod}.
        3. Make it weird. If it's a boring object, give it a personality or a strange texture.
        4. High contrast, distinct silhouette.
        
        (This is for a memory palace technique, so visual distinctness is priority #1).
    `;

    return engineeredPrompt;
}

export { enhancePrompt };
