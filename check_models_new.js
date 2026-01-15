
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
    console.error("No API key found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // The listModels method might not be directly on genAI in all SDK versions, 
        // but we can try to fetch the models list via the REST API if needed.
        // For now, let's just try to instantiate and probe a few known models.
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro-vision"];

        console.log("Probing models...");
        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                // We'll just check if we can get the model object, 
                // but usually the error happens during the request.
                console.log(`- Model ${modelName} initialized.`);
            } catch (err) {
                console.log(`- Model ${modelName} failed to initialize: ${err.message}`);
            }
        }

        // Let's actually try a very small request to 1.5-flash
        console.log("\nTesting gemini-1.5-flash with a simple prompt...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success! Response:", result.response.text());

    } catch (err) {
        console.error("General error:", err);
    }
}

listModels();
