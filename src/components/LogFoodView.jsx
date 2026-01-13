import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import styles from './LogFoodView.module.css';

const LogFoodView = ({ onFoodLogged }) => {
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [mealType, setMealType] = useState('breakfast');
    const [lastLoggedId, setLastLoggedId] = useState(null);

    // New Food Form State
    const [newFood, setNewFood] = useState({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        serving_size: ''
    });

    useEffect(() => {
        if (searchTerm.length > 0) {
            searchFoods();
        } else {
            setSearchResults([]);
        }
    }, [searchTerm]);

    const searchFoods = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('foods')
                .select('*')
                .ilike('name', `%${searchTerm}%`)
                .limit(10);

            if (error) throw error;
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching foods:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFood = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('User profile not loaded. Please wait or refresh.');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('foods')
                .insert([{
                    ...newFood,
                    created_by: user.id,
                    calories: Number(newFood.calories),
                    protein: Number(newFood.protein),
                    carbs: Number(newFood.carbs),
                    fat: Number(newFood.fat)
                }])
                .select()
                .single();

            if (error) throw error;

            // Add to local results
            setSearchResults([data]);
            setShowCreateForm(false);
            setNewFood({ name: '', calories: '', protein: '', carbs: '', fat: '', serving_size: '' });
        } catch (error) {
            console.error('Error creating food:', error);
            alert('Failed to create food');
        }
    };

    const handleLogFood = async (food) => {
        if (!food) return;
        if (!user) {
            alert('User profile not loaded. Please wait or refresh.');
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        try {
            const { error } = await supabase
                .from('daily_logs')
                .insert([{
                    user_id: user.id,
                    date: today,
                    meal_type: mealType,
                    food_name: food.name,
                    calories: food.calories,
                    protein: food.protein,
                    carbs: food.carbs,
                    fat: food.fat
                }]);

            if (error) throw error;

            if (onFoodLogged) onFoodLogged(); // Trigger update in parent

            // Show success animation
            setLastLoggedId(food.id);
            setTimeout(() => setLastLoggedId(null), 2000);
        } catch (error) {
            console.error('Error logging food:', error);
            alert('Failed to log food');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Log Food</h2>
                <p className={styles.subtitle}>Track your meals to reach your goals.</p>
            </div>

            {/* Meal Selector */}
            <div className={styles.mealSelectorContainer}>
                <label className={styles.label}>Meal Type</label>
                <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className={styles.select}
                >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                </select>
            </div>

            {/* Search Bar */}
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search for food (e.g., Banana, Chicken)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
                {loading && <div className={styles.spinner}></div>}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && !showCreateForm && (
                <div className={styles.resultsList}>
                    {searchResults.map(food => (
                        <div key={food.id} className={styles.foodItem}>
                            <div className={styles.foodInfo}>
                                <span className={styles.foodName}>{food.name}</span>
                                <span className={styles.foodDetail}>{food.calories} kcal • {food.serving_size}</span>
                                <div className={styles.macros}>
                                    <span>P: {food.protein}g</span>
                                    <span>C: {food.carbs}g</span>
                                    <span>F: {food.fat}g</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleLogFood(food)}
                                className={`${styles.addButton} ${lastLoggedId === food.id ? styles.success : ''}`}
                            >
                                {lastLoggedId === food.id ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* No Results / Create New */}
            {searchTerm && searchResults.length === 0 && !loading && !showCreateForm && (
                <div className={styles.noResults}>
                    <p>No food found matching "{searchTerm}"</p>
                    <button onClick={() => setShowCreateForm(true)} className={styles.createButton}>
                        Create Custom Food
                    </button>
                </div>
            )}

            {/* Create Food Form */}
            {showCreateForm && (
                <div className={styles.createForm}>
                    <h3 className={styles.formTitle}>Create New Food</h3>
                    <form onSubmit={handleCreateFood}>
                        <div className={styles.formGroup}>
                            <label>Name</label>
                            <input
                                required
                                value={newFood.name}
                                onChange={e => setNewFood({ ...newFood, name: e.target.value })}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>Calories</label>
                                <input
                                    required
                                    type="number"
                                    value={newFood.calories}
                                    onChange={e => setNewFood({ ...newFood, calories: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Serving</label>
                                <input
                                    required
                                    placeholder="e.g. 100g"
                                    value={newFood.serving_size}
                                    onChange={e => setNewFood({ ...newFood, serving_size: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label>Protein (g)</label>
                                <input
                                    type="number"
                                    value={newFood.protein}
                                    onChange={e => setNewFood({ ...newFood, protein: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Carbs (g)</label>
                                <input
                                    type="number"
                                    value={newFood.carbs}
                                    onChange={e => setNewFood({ ...newFood, carbs: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Fat (g)</label>
                                <input
                                    type="number"
                                    value={newFood.fat}
                                    onChange={e => setNewFood({ ...newFood, fat: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            <button type="button" onClick={() => setShowCreateForm(false)} className={styles.cancelButton}>Cancel</button>
                            <button type="submit" className={styles.saveButton}>Save Food</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default LogFoodView;
