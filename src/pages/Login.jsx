import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { supabase } from '../supabaseClient';
import styles from '../components/ContactForm.module.css';

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07-2.3 2.3" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);

const Login = () => {
    const navigate = useNavigate();
    const { signIn, signUp } = useUser();
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState(null);

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setErrors({});
        setAuthError(null);
        setFormData({ email: '', password: '', confirmPassword: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (errors[e.target.id]) {
            setErrors({ ...errors, [e.target.id]: null });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        if (isSignUp) {
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError(null);

        if (!validate()) return;

        setLoading(true);
        try {
            if (isSignUp) {
                await signUp(formData.email, formData.password);
                navigate('/onboarding');
            } else {
                const data = await signIn(formData.email, formData.password);

                // Check if the user has a profile with targets set
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('daily_calories_target')
                    .eq('id', data.session.user.id)
                    .single();

                if (profile && profile.daily_calories_target) {
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            }
        } catch (error) {
            console.error("Auth error:", error);
            setAuthError(error.message || 'An error occurred during authentication');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg)',
            padding: 'var(--spacing-md)'
        }}>
            <div className={styles.container} style={{ maxWidth: '400px', width: '100%' }}>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: 'var(--color-primary)',
                    textAlign: 'center',
                    marginBottom: '0.5rem'
                }}>
                    Balance<span style={{ color: 'var(--color-text-main)' }}>AI</span>
                </div>

                <h2 className={styles.title} style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className={styles.subtitle}>
                    {isSignUp ? 'Join us to start your journey' : 'Sign in to continue your journey'}
                </p>

                {authError && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {authError}
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            type="email"
                            id="email"
                            className={styles.input}
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            style={errors.email ? { borderColor: '#ef4444' } : {}}
                        />
                        {errors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email}</span>}
                    </div>



                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className={styles.input}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                style={{ paddingRight: '40px', width: '100%', ...(errors.password ? { borderColor: '#ef4444' } : {}) }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.password && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password}</span>}
                    </div>

                    {isSignUp && (
                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    className={styles.input}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    style={{ paddingRight: '40px', width: '100%', ...(errors.confirmPassword ? { borderColor: '#ef4444' } : {}) }}

                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        color: 'var(--color-text-muted)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {errors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.confirmPassword}</span>}
                        </div>
                    )}

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={toggleMode}
                            style={{
                                color: 'var(--color-primary)',
                                background: 'none',
                                padding: 0,
                                textDecoration: 'underline',
                                fontSize: 'inherit',
                                fontWeight: '600'
                            }}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
