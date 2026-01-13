import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import styles from './AnalyzeView.module.css';

const AnalyzeView = () => {
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [mealType, setMealType] = useState('breakfast');

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const analyzeFood = async () => {
        if (!image) return;

        setLoading(true);
        setError(null);

        try {
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
            if (!apiKey) {
                throw new Error("API Key is missing. Please check your .env file and restart the server.");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onloadend = async () => {
                const base64Data = reader.result.split(',')[1];

                const prompt = "Analyze this image of food. Identify the dish and estimate the calories, protein, carbs, and fat. Return ONLY a JSON object (no markdown, no backticks) with these keys: dishName, calories (number), protein (string with unit), carbs (string with unit), fat (string with unit), healthyTips (short string).";

                const result = await model.generateContent([
                    prompt,
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: image.type,
                        },
                    },
                ]);

                const response = await result.response;
                const text = response.text();

                // Clean up the response if it contains markdown code blocks
                const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

                try {
                    const jsonResult = JSON.parse(cleanedText);
                    setResult(jsonResult);
                } catch (e) {
                    console.error("Error parsing JSON:", e);
                    setError("Could not parse nutrition data. Please try again.");
                }
                setLoading(false);
            };
        } catch (err) {
            console.error("Error analyzing image:", err);
            setError("Failed to analyze image. Please check your API key and try again.");
            setLoading(false);
        }
    };

    const handleAddToLog = () => {
        alert(`Added ${result.dishName} to ${mealType} log!`);
        // Here you would integrate with your global state/context to actually add the food
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Analyze Your Food</h2>
                <p className={styles.subtitle}>Upload a photo of your meal to get instant nutritional insights.</p>
            </div>

            {!result && (
                <div className={styles.uploadSection}>
                    <label className={styles.uploadArea}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className={styles.fileInput}
                        />
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                        ) : (
                            <div className={styles.uploadContent}>
                                <svg className={styles.uploadIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className={styles.uploadText}>Click to upload or drag and drop</p>
                                <span className={styles.uploadButton}>Select Image</span>
                            </div>
                        )}
                    </label>

                    {image && !loading && (
                        <div className={styles.actions}>
                            <button onClick={analyzeFood} className={styles.analyzeButton}>
                                Analyze Food
                            </button>
                        </div>
                    )}
                </div>
            )}

            {loading && (
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Analyzing your delicious meal...</p>
                </div>
            )}

            {error && (
                <div className={styles.error}>
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className={styles.retryButton}>Try Again</button>
                </div>
            )}

            {result && (
                <div className={styles.resultCard}>
                    <div className={styles.resultHeader}>
                        <img src={previewUrl} alt="Analyzed Food" className={styles.resultImage} />
                        <div>
                            <h3 className={styles.dishName}>{result.dishName}</h3>
                            <p className={styles.tips}>{result.healthyTips}</p>
                        </div>
                    </div>

                    <div className={styles.nutritionGrid}>
                        <div className={styles.nutritionItem}>
                            <span className={styles.nutritionValue}>{result.calories}</span>
                            <span className={styles.nutritionLabel}>Calories</span>
                        </div>
                        <div className={styles.nutritionItem}>
                            <span className={styles.nutritionValue}>{result.protein}</span>
                            <span className={styles.nutritionLabel}>Protein</span>
                        </div>
                        <div className={styles.nutritionItem}>
                            <span className={styles.nutritionValue}>{result.carbs}</span>
                            <span className={styles.nutritionLabel}>Carbs</span>
                        </div>
                        <div className={styles.nutritionItem}>
                            <span className={styles.nutritionValue}>{result.fat}</span>
                            <span className={styles.nutritionLabel}>Fat</span>
                        </div>
                    </div>

                    <div className={styles.logAction}>
                        <div className={styles.selectorGroup}>
                            <label>Add to:</label>
                            <select
                                value={mealType}
                                onChange={(e) => setMealType(e.target.value)}
                                className={styles.mealSelector}
                            >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                            </select>
                        </div>
                        <button onClick={handleAddToLog} className={styles.addButton}>
                            Add to Log
                        </button>
                        <button onClick={() => { setImage(null); setPreviewUrl(null); setResult(null); }} className={styles.resetButton}>
                            Analyze Another
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyzeView;
