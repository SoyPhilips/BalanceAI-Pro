import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import styles from './AnalyzeView.module.css';

const AnalyzeView = () => {
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [mealType, setMealType] = useState('breakfast');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const { user } = useUser();

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
            if (!validTypes.includes(file.type)) {
                setError("Formato de imagen no compatible. Por favor usa JPG, PNG o WebP (los GIFs no son compatibles).");
                return;
            }

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

            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onloadend = async () => {
                const base64Data = reader.result.split(',')[1];
                const prompt = "Analyze this image of food. Identify the dish and estimate the calories, protein, carbs, and fat. Return ONLY a JSON object (no markdown, no backticks) with these keys: dishName, calories (number), protein (string with unit), carbs (string with unit), fat (string with unit), healthyTips (short string). Example: {\"dishName\": \"Burger\", \"calories\": 500, \"protein\": \"20g\", \"carbs\": \"40g\", \"fat\": \"25g\", \"healthyTips\": \"Add more greens.\"}";

                let response;
                const modelsToTry = [
                    "gemini-flash-latest",
                    "gemini-2.0-flash",
                    "gemini-2.0-flash-lite",
                    "gemini-2.5-flash",
                    "gemini-1.5-flash"
                ];

                let lastError = null;

                for (const modelName of modelsToTry) {
                    try {
                        console.log(`Intentando con modelo: ${modelName}...`);
                        const model = genAI.getGenerativeModel({ model: modelName });
                        const result = await model.generateContent([
                            prompt,
                            { inlineData: { data: base64Data, mimeType: image.type } }
                        ]);
                        response = await result.response;
                        console.log(`✅ Éxito con ${modelName}`);
                        break;
                    } catch (err) {
                        lastError = err;
                        console.warn(`❌ Falló ${modelName}:`, err.message);

                        if (err.message?.includes("429") || err.message?.includes("quota")) {
                            // Si el límite es 0, probamos el siguiente modelo por si acaso uno tiene cuota y otro no
                            if (err.message?.includes("limit: 0")) {
                                continue;
                            }
                            throw err;
                        }

                        if (err.message?.includes("404") || err.message?.includes("not found")) {
                            continue;
                        }

                        throw err;
                    }
                }

                if (!response) {
                    throw lastError || new Error("No se pudo conectar con ningún modelo de IA.");
                }

                const text = response.text();
                // Limpieza profunda del JSON
                const cleanedText = text
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .replace(/`/g, '')
                    .trim();

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

            // Manejo específico de errores
            let errorMessage = "Error al analizar la imagen. Por favor, intenta de nuevo.";

            if (err.message?.includes("quota") || err.message?.includes("429")) {
                errorMessage = "⚠️ Has excedido la cuota de tu API key. Por favor, espera unos minutos o usa una nueva API key de Google AI Studio.";
            } else if (err.message?.includes("not found") || err.message?.includes("404")) {
                errorMessage = "❌ El modelo gemini-1.5-flash no se encontró. Intentando con un modelo alternativo...";
                console.warn("Model 1.5-flash not found, consider using another one or checking your API key status.");
            } else if (err.message?.includes("rate limit") || err.message?.includes("Too Many Requests")) {
                errorMessage = "⏸️ Demasiadas solicitudes. Por favor espera un momento antes de intentar de nuevo.";
            } else if (err.message?.includes("API Key")) {
                errorMessage = "🔑 API Key no válida. Por favor verifica tu configuración en el archivo .env";
            } else if (err.message?.includes("network") || err.message?.includes("fetch")) {
                errorMessage = "🌐 Error de conexión. Verifica tu conexión a internet.";
            } else if (err.message?.includes("MIME type") || err.message?.includes("Unsupported")) {
                errorMessage = "🖼️ El formato de esta imagen no es compatible con la IA. Prueba con una foto en JPG o PNG.";
            }

            setError(errorMessage);
            setLoading(false);
        }
    };

    const handleAddToLog = async () => {
        if (!result || !user) {
            setError("No se pudo identificar al usuario o faltan datos del análisis.");
            return;
        }

        setIsSaving(true);
        setSaveSuccess(false);
        const today = new Date().toISOString().split('T')[0];

        try {
            // Limpiar valores numéricos (quitar 'g' de proteínas, etc)
            const getNum = (val) => {
                if (typeof val === 'number') return val;
                if (!val) return 0;
                return parseFloat(val.replace(/[^\d.]/g, '')) || 0;
            };

            const { error: logError } = await supabase
                .from('daily_logs')
                .insert([{
                    user_id: user.id,
                    date: today,
                    meal_type: mealType,
                    food_name: result.dishName,
                    calories: getNum(result.calories),
                    protein: getNum(result.protein),
                    carbs: getNum(result.carbs),
                    fat: getNum(result.fat),
                    healthy_tips: result.healthyTips
                }]);

            if (logError) throw logError;

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving to log:', err);
            setError("Error al guardar en el historial. Inténtalo de nuevo.");
        } finally {
            setIsSaving(false);
        }
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
                            accept=".jpg,.jpeg,.png,.webp"
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
                        <button
                            onClick={handleAddToLog}
                            className={`${styles.addButton} ${saveSuccess ? styles.success : ''}`}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : saveSuccess ? '✓ Added' : 'Add to Log'}
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
