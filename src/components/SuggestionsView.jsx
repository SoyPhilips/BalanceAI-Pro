import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import styles from './SuggestionsView.module.css';

const SuggestionsView = ({ onFoodLogged }) => {
    const { user } = useUser();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [filter, setFilter] = useState('all');
    const [quotaExceeded, setQuotaExceeded] = useState(false);
    const [lastLoggedRecipeId, setLastLoggedRecipeId] = useState(null);

    // Reliable placeholder (gray background, no text to avoid overlap)
    const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%239CA3AF'%3EImage Pending...%3C/text%3E%3C/svg%3E";

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            const { data, error } = await supabase
                .from('recipes')
                .select('*');

            if (error) throw error;
            setRecipes(data);

            // Identify recipes that need images
            const recipesToSearch = data.filter(r => !r.image_url || r.image_url === PLACEHOLDER_IMAGE);
            if (recipesToSearch.length > 0) {
                processSearchQueue(recipesToSearch);
            }
        } catch (error) {
            console.error('Error fetching recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const processSearchQueue = async (recipesToSearch) => {
        for (const recipe of recipesToSearch) {
            if (quotaExceeded) {
                console.warn("Daily quota exceeded. Stopping search.");
                break;
            }
            await searchRecipeImage(recipe);
            // Small delay to be nice to the API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    };

    const handleAddToLog = async (recipe, e) => {
        e.stopPropagation(); // Prevent opening modal
        try {
            const { error } = await supabase
                .from('daily_logs')
                .insert([{
                    user_id: user.id,
                    date: new Date().toISOString().split('T')[0],
                    meal_type: recipe.category || 'lunch',
                    food_name: recipe.name,
                    calories: recipe.calories,
                    protein: recipe.protein,
                    carbs: recipe.carbs,
                    fat: recipe.fat
                }]);

            if (error) throw error;
            if (onFoodLogged) onFoodLogged(); // Trigger real-time update in dashboard

            // Success animation
            setLastLoggedRecipeId(recipe.id);
            setTimeout(() => setLastLoggedRecipeId(null), 2000);
        } catch (error) {
            console.error('Error logging recipe:', error);
            alert('Failed to log recipe');
        }
    };

    const searchRecipeImage = async (recipe) => {
        if (quotaExceeded) return;

        // Use the specific Search API Key and Engine ID
        const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
        const cx = 'f669a8c9cd3894928'; // Provided by user

        if (!apiKey) {
            console.warn("No Google Search API Key found");
            return;
        }

        try {
            console.log(`Searching image for: ${recipe.name}...`);
            // Refined query: removed 'cooked dish' (bad for shakes/salads), added 'close up'
            const query = `${recipe.name} food close up photography -person -people -product -packaging`;
            const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=1&imgSize=large&imgType=photo`);

            if (!response.ok) {
                if (response.status === 429) {
                    console.warn("Google Search API Quota Exceeded (429)");
                    setQuotaExceeded(true);
                    return;
                }
                const errorData = await response.json();
                console.error("Search API Error:", errorData);
                return;
            }

            const data = await response.json();
            if (data.items && data.items.length > 0) {
                const imageUrl = data.items[0].link;
                console.log(`Found image for ${recipe.name}:`, imageUrl);

                setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...r, image_url: imageUrl } : r));

                const { error } = await supabase
                    .from('recipes')
                    .update({ image_url: imageUrl })
                    .eq('id', recipe.id);

                if (error) console.error("Error saving image to DB:", error);
            } else {
                console.warn(`No images found for ${recipe.name}`);
            }
        } catch (error) {
            console.error("Error searching image:", error);
        }
    };

    const resetImages = async () => {
        if (!window.confirm("¿Quieres regenerar todas las imágenes? Esto borrará las actuales y buscará nuevas.")) return;

        setLoading(true);
        try {
            // 1. Reset local state to show placeholders
            setRecipes(prev => prev.map(r => ({ ...r, image_url: null })));

            // 2. Clear DB
            const { error } = await supabase
                .from('recipes')
                .update({ image_url: null })
                .neq('id', 0); // Update all

            if (error) throw error;

            // 3. Trigger re-fetch which will trigger re-search
            fetchRecipes();

        } catch (error) {
            console.error("Error resetting images:", error);
        } finally {
            setLoading(false);
        }
    };

    const getDisplayRecipes = () => {
        if (filter === 'all') {
            // Sort by category order: Breakfast, Lunch, Dinner, Snack
            const order = { 'breakfast': 1, 'lunch': 2, 'dinner': 3, 'snack': 4 };
            return [...recipes].sort((a, b) => (order[a.category] || 99) - (order[b.category] || 99));
        }
        return recipes.filter(r => r.category === filter);
    };

    const displayRecipes = getDisplayRecipes();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 className={styles.title}>Meal Suggestions</h2>
                    <button
                        onClick={resetImages}
                        style={{
                            background: 'transparent',
                            border: '1px solid #4B5563',
                            color: '#9CA3AF',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Regenerar imágenes"
                    >
                        ↻
                    </button>
                </div>
                <p className={styles.subtitle}>Curated recipes to help you meet your goals.</p>
            </div>

            {/* Filter Selector */}
            <div className={styles.filterContainer}>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="all">All Meals</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                </select >
            </div >

            {
                loading ? (
                    <div className={styles.loading} > Loading recipes...</div>
                ) : (
                    <div className={styles.recipeGrid}>
                        {displayRecipes.map(recipe => (
                            <div
                                key={recipe.id}
                                className={styles.recipeCard}
                                onClick={() => setSelectedRecipe(recipe)}
                            >
                                <div className={styles.imageContainer}>
                                    <img
                                        src={recipe.image_url || PLACEHOLDER_IMAGE}
                                        alt={recipe.name}
                                        className={styles.recipeImage}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            if (recipe.image_url !== PLACEHOLDER_IMAGE) {
                                                e.target.src = PLACEHOLDER_IMAGE;
                                                // Removed auto-retry to save quota
                                            }
                                        }}
                                    />
                                    <div className={styles.caloriesBadge}>{recipe.calories} kcal</div>
                                </div>
                                <div className={styles.cardContent}>
                                    <h4 className={styles.recipeName}>{recipe.name}</h4>
                                    <p className={styles.recipeDesc}>{recipe.description}</p>
                                    <div className={styles.macros}>
                                        <span>P: {recipe.protein}g</span>
                                        <span>C: {recipe.carbs}g</span>
                                        <span>F: {recipe.fat}g</span>
                                    </div>
                                    <button
                                        className={`${styles.addButton} ${lastLoggedRecipeId === recipe.id ? styles.success : ''}`}
                                        onClick={(e) => handleAddToLog(recipe, e)}
                                    >
                                        {lastLoggedRecipeId === recipe.id ? 'Added! ✓' : 'Add to Log'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div >
                )}

            {/* Recipe Modal */}
            {
                selectedRecipe && (
                    <div className={styles.modalOverlay} onClick={() => setSelectedRecipe(null)}>
                        <div className={styles.modal} onClick={e => e.stopPropagation()}>
                            <button className={styles.closeButton} onClick={() => setSelectedRecipe(null)}>×</button>

                            <div className={styles.modalHeader}>
                                <img src={selectedRecipe.image_url || PLACEHOLDER_IMAGE} alt={selectedRecipe.name} className={styles.modalImage} />
                                <div className={styles.modalTitleOverlay}>
                                    <h2>{selectedRecipe.name}</h2>
                                    <span className={styles.modalCalories}>{selectedRecipe.calories} kcal</span>
                                </div>
                            </div>

                            <div className={styles.modalContent}>
                                <p className={styles.modalDesc}>{selectedRecipe.description}</p>

                                <div className={styles.modalGrid}>
                                    <div className={styles.ingredientsSection}>
                                        <h3>Ingredients</h3>
                                        <ul>
                                            {selectedRecipe.ingredients && JSON.parse(selectedRecipe.ingredients).map((ing, i) => (
                                                <li key={i}>{ing}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className={styles.instructionsSection}>
                                        <h3>Instructions</h3>
                                        <p>{selectedRecipe.instructions}</p>
                                    </div>
                                </div>

                                <div className={styles.modalActions}>
                                    <button
                                        className={styles.modalAddButton}
                                        onClick={(e) => {
                                            handleAddToLog(selectedRecipe, e);
                                            setSelectedRecipe(null);
                                        }}
                                    >
                                        Add to Daily Log
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default SuggestionsView;
