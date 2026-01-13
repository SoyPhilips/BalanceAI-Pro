import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import styles from './Onboarding.module.css';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        goal: '', // 'lose', 'maintain', 'gain_muscle', 'gain_weight'
        gender: '',
        age: '',
        height: '',
        weight: '',
        desiredWeight: '',
        pace: '' // 'slow', 'moderate', 'fast'
    });
    const [errors, setErrors] = useState({});

    // Progress calculation
    const progress = ((step + 1) / 4) * 100;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSelect = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateStep = () => {
        const newErrors = {};
        let isValid = true;

        if (step === 0) {
            if (!formData.name.trim()) {
                newErrors.name = 'Name is required';
                isValid = false;
            } else if (formData.name.length < 2) {
                newErrors.name = 'Name must be at least 2 characters';
                isValid = false;
            } else if (!/^[a-zA-Z\s]*$/.test(formData.name)) {
                newErrors.name = 'Name must contain only letters';
                isValid = false;
            }
        } else if (step === 1) {
            if (!formData.goal) {
                newErrors.goal = 'Please select a goal';
                isValid = false;
            }
        } else if (step === 2) {
            if (!formData.gender) newErrors.gender = 'Required';
            if (!formData.age || formData.age < 15 || formData.age > 99) newErrors.age = 'Age must be 15-99';
            if (!formData.height || formData.height < 100 || formData.height > 250) newErrors.height = 'Invalid height';
            if (!formData.weight || formData.weight < 30 || formData.weight > 300) newErrors.weight = 'Invalid weight';
            if (!formData.desiredWeight) newErrors.desiredWeight = 'Required';

            // Validate desired weight against goal
            if (formData.goal === 'lose' && Number(formData.desiredWeight) >= Number(formData.weight)) {
                newErrors.desiredWeight = 'Desired weight must be lower than current weight';
            }
            if ((formData.goal === 'gain_muscle' || formData.goal === 'gain_weight') && Number(formData.desiredWeight) <= Number(formData.weight)) {
                newErrors.desiredWeight = 'Desired weight must be higher than current weight';
            }

            if (Object.keys(newErrors).length > 0) isValid = false;
        } else if (step === 3) {
            if (!formData.pace) {
                newErrors.pace = 'Please select a pace';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const { updateUser, user } = useUser();

    // Save data progressively at each step
    const saveStepData = async (stepNumber) => {
        try {
            let updates = {};

            if (stepNumber === 0) {
                // Step 1: Save name
                updates = { name: formData.name };
            } else if (stepNumber === 1) {
                // Step 2: Save goal
                updates = { goal: formData.goal };
            } else if (stepNumber === 2) {
                // Step 3: Save personal details
                updates = {
                    gender: formData.gender,
                    age: parseInt(formData.age) || null,
                    height: parseFloat(formData.height) || null,
                    weight: parseFloat(formData.weight) || null,
                    desired_weight: parseFloat(formData.desiredWeight) || null
                };
            }

            if (Object.keys(updates).length > 0) {
                await updateUser(updates);
            }
        } catch (err) {
            console.error('Error saving step data:', err);
            // Don't block navigation on save errors for intermediate steps
        }
    };

    const handleNext = async () => {
        if (validateStep()) {
            setLoading(true);
            setError(null);

            try {
                if (step < 3) {
                    // Save current step data before moving to next
                    await saveStepData(step);
                    setStep(prev => prev + 1);
                } else {
                    // Final step: Save pace and daily calories
                    const selectedPace = getPaceOptions().find(p => p.id === formData.pace);
                    const calorieTarget = selectedPace ? selectedPace.calories : calculateCalories();

                    await updateUser({
                        pace: formData.pace,
                        daily_calories_target: Math.round(calorieTarget) || 2000
                    });

                    navigate('/dashboard');
                }
            } catch (err) {
                setError('Error al guardar. Por favor intenta de nuevo.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(prev => prev - 1);
        }
    };

    // Calculations
    const calculateCalories = () => {
        // Mifflin-St Jeor
        const w = Number(formData.weight);
        const h = Number(formData.height);
        const a = Number(formData.age);
        let bmr = (10 * w) + (6.25 * h) - (5 * a);

        if (formData.gender === 'male') bmr += 5;
        else bmr -= 161;

        const tdee = bmr * 1.2; // Sedentary default

        return Math.round(tdee);
    };

    const getPaceOptions = () => {
        const maintenance = calculateCalories();
        const isLose = formData.goal === 'lose';
        const isGain = formData.goal === 'gain_muscle' || formData.goal === 'gain_weight';
        const multiplier = isLose ? -1 : 1;

        if (formData.goal === 'maintain') {
            return [{
                id: 'maintain',
                title: 'Maintain Weight',
                calories: maintenance,
                desc: 'Keep your current weight stable.',
                time: 'Forever'
            }];
        }

        return [
            {
                id: 'slow',
                title: 'Gentle Pace',
                calories: maintenance + (250 * multiplier),
                desc: isLose ? 'Lose ~0.25kg/week' : 'Gain ~0.25kg/week',
                time: 'Slow & Steady'
            },
            {
                id: 'moderate',
                title: 'Moderate Pace',
                calories: maintenance + (500 * multiplier),
                desc: isLose ? 'Lose ~0.5kg/week' : 'Gain ~0.5kg/week',
                time: 'Recommended'
            },
            {
                id: 'fast',
                title: 'Intense Pace',
                calories: maintenance + (750 * multiplier),
                desc: isLose ? 'Lose ~0.75kg/week' : 'Gain ~0.75kg/week',
                time: 'Fast Results'
            }
        ];
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>

                {/* Step 1: Presentation */}
                {step === 0 && (
                    <div className={styles.stepContainer}>
                        <h2 className={styles.title}>Welcome!</h2>
                        <p className={styles.subtitle}>Let's get to know you. What should we call you?</p>
                        <div className={styles.inputGroup}>
                            <label htmlFor="name" className={styles.label}>Your Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="e.g. Alex"
                                autoFocus
                            />
                            {errors.name && <p className={styles.error}>{errors.name}</p>}
                        </div>
                    </div>
                )}

                {/* Step 2: Goal */}
                {step === 1 && (
                    <div className={styles.stepContainer}>
                        <h2 className={styles.title}>Hi {formData.name}!</h2>
                        <p className={styles.subtitle}>What is your primary goal right now?</p>
                        <div className={styles.radioGrid}>
                            {['lose', 'maintain', 'gain_muscle', 'gain_weight'].map(option => (
                                <div
                                    key={option}
                                    className={`${styles.radioOption} ${formData.goal === option ? styles.selected : ''}`}
                                    onClick={() => handleSelect('goal', option)}
                                >
                                    <span className={styles.radioLabel}>
                                        {option === 'lose' && 'Lose Weight'}
                                        {option === 'maintain' && 'Maintain Weight'}
                                        {option === 'gain_muscle' && 'Gain Muscle'}
                                        {option === 'gain_weight' && 'Gain Weight'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {errors.goal && <p className={styles.error}>{errors.goal}</p>}
                    </div>
                )}

                {/* Step 3: Personal Info */}
                {step === 2 && (
                    <div className={styles.stepContainer}>
                        <h2 className={styles.title}>Personal Details</h2>
                        <p className={styles.subtitle}>This helps us calculate your personalized plan.</p>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Gender</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['male', 'female'].map(g => (
                                    <button
                                        key={g}
                                        className={`${styles.radioOption} ${formData.gender === g ? styles.selected : ''}`}
                                        onClick={() => handleSelect('gender', g)}
                                        style={{ flex: 1, padding: '0.75rem' }}
                                    >
                                        {g === 'male' ? 'Male' : 'Female'}
                                    </button>
                                ))}
                            </div>
                            {errors.gender && <p className={styles.error}>{errors.gender}</p>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="Years"
                                />
                                {errors.age && <p className={styles.error}>{errors.age}</p>}
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Height (cm)</label>
                                <input
                                    type="number"
                                    name="height"
                                    value={formData.height}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="cm"
                                />
                                {errors.height && <p className={styles.error}>{errors.height}</p>}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Current Weight (kg)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="kg"
                                />
                                {errors.weight && <p className={styles.error}>{errors.weight}</p>}
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Desired Weight (kg)</label>
                                <input
                                    type="number"
                                    name="desiredWeight"
                                    value={formData.desiredWeight}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="kg"
                                />
                                {errors.desiredWeight && <p className={styles.error}>{errors.desiredWeight}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Results */}
                {step === 3 && (
                    <div className={styles.stepContainer}>
                        <h2 className={styles.title}>Your Daily Plan</h2>
                        <p className={styles.subtitle}>Based on your stats, here are your recommended daily calories.</p>

                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                                padding: '1rem',
                                borderRadius: 'var(--radius-sm)',
                                marginBottom: '1rem',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {getPaceOptions().map(option => (
                                <div
                                    key={option.id}
                                    className={`${styles.resultCard} ${formData.pace === option.id ? styles.selected : ''}`}
                                    onClick={() => handleSelect('pace', option.id)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div className={styles.paceTitle}>{option.title}</div>
                                            <div className={styles.paceDesc}>{option.desc} • {option.time}</div>
                                        </div>
                                        <div className={styles.calories}>{option.calories} kcal</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {errors.pace && <p className={styles.error}>{errors.pace}</p>}
                    </div>
                )}

                <div className={styles.buttonGroup}>
                    {step > 0 && (
                        <button onClick={handleBack} className={styles.backBtn}>
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        className={styles.nextBtn}
                        disabled={loading}
                    >
                        {loading ? 'Cargando...' : (step === 3 ? 'Start Journey' : 'Next')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
