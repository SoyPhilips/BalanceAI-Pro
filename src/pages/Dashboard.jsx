import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import styles from './Dashboard.module.css';
import AnalyzeView from '../components/AnalyzeView';
import ProfileView from '../components/ProfileView';
import SettingsView from '../components/SettingsView';
import LogFoodView from '../components/LogFoodView';
import SuggestionsView from '../components/SuggestionsView';

// Simple SVG Icons
const HomeIcon = () => (
    <svg className={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const LogIcon = () => (
    <svg className={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const AnalyzeIcon = () => (
    <svg className={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const SuggestionsIcon = () => (
    <svg className={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const ProfileIcon = () => (
    <svg className={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const SettingsIcon = () => (
    <svg className={styles.navIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const Dashboard = () => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('home');
    const [dailyCalories, setDailyCalories] = useState(0);
    const [targetCalories, setTargetCalories] = useState(2000);
    const [todayLogs, setTodayLogs] = useState([]);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (user) {
            // Set target from user profile
            if (user.daily_calories_target) {
                setTargetCalories(user.daily_calories_target);
            } else {
                // Fallback calculation if not set
                // This is a simplified fallback
                setTargetCalories(2000);
            }

            fetchDailyLogs();

            // Subscribe to daily_logs changes
            const logsSubscription = supabase
                .channel('daily_logs_changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'daily_logs',
                    filter: `user_id=eq.${user.id}`
                }, () => {
                    fetchDailyLogs();
                })
                .subscribe();

            // Subscribe to profile changes (for goal/target updates)
            const profileSubscription = supabase
                .channel('profile_changes')
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`
                }, (payload) => {
                    if (payload.new.daily_calories_target) {
                        setTargetCalories(payload.new.daily_calories_target);
                    }
                })
                .subscribe();

            return () => {
                logsSubscription.unsubscribe();
                profileSubscription.unsubscribe();
            };
        }
    }, [user]);

    const fetchDailyLogs = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('daily_logs')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', today)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setTodayLogs(data || []);
            const total = (data || []).reduce((sum, log) => sum + log.calories, 0);
            setDailyCalories(total);
        } catch (error) {
            console.error('Error fetching daily logs:', error);
        }
    };

    const handleDeleteLog = async (logId) => {
        try {
            const { error } = await supabase
                .from('daily_logs')
                .delete()
                .eq('id', logId);

            if (error) throw error;

            // Update local state
            setTodayLogs(prev => {
                const updated = prev.filter(log => log.id !== logId);
                const newTotal = updated.reduce((sum, log) => sum + log.calories, 0);
                setDailyCalories(newTotal);
                return updated;
            });
        } catch (error) {
            console.error('Error deleting log:', error);
            alert('Failed to delete food log');
        }
    };

    const getMealTypeLabel = (type) => {
        const labels = {
            breakfast: '🌅 Breakfast',
            lunch: '☀️ Lunch',
            dinner: '🌙 Dinner',
            snack: '🍎 Snack'
        };
        return labels[type] || type;
    };

    const percentage = Math.min(Math.round((dailyCalories / targetCalories) * 100), 100);

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div
                    className={styles.logo}
                    onClick={() => setActiveTab('home')}
                >
                    Balance<span style={{ color: '#fff' }}>AI</span>
                </div>
                <nav className={styles.nav}>
                    <div
                        className={`${styles.navItem} ${activeTab === 'home' ? styles.active : ''}`}
                        onClick={() => setActiveTab('home')}
                    >
                        <HomeIcon />
                        <span>Home</span>
                    </div>
                    <div
                        className={`${styles.navItem} ${activeTab === 'log' ? styles.active : ''}`}
                        onClick={() => setActiveTab('log')}
                    >
                        <LogIcon />
                        <span>Log Food</span>
                    </div>
                    <div
                        className={`${styles.navItem} ${activeTab === 'suggestions' ? styles.active : ''}`}
                        onClick={() => setActiveTab('suggestions')}
                    >
                        <SuggestionsIcon />
                        <span>Sugerencias</span>
                    </div>
                    <div
                        className={`${styles.navItem} ${activeTab === 'analyze' ? styles.active : ''}`}
                        onClick={() => setActiveTab('analyze')}
                    >
                        <AnalyzeIcon />
                        <span>Analyze</span>
                    </div>

                    <div
                        className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <ProfileIcon />
                        <span>Profile</span>
                    </div>
                    <div
                        className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <SettingsIcon />
                        <span>Settings</span>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {activeTab === 'home' && (
                    <>
                        <div className={styles.header}>
                            <h1>Welcome Back, {user?.name || 'User'}!</h1>
                            <p style={{ color: 'var(--color-text-muted)' }}>Here's your daily overview.</p>
                        </div>

                        {/* Progress Bar Section */}
                        <div className={styles.progressCard}>
                            <div className={styles.progressTitle}>
                                <span>Daily Calorie Goal</span>
                                <span>{percentage}%</span>
                            </div>
                            <div className={styles.progressBarContainer}>
                                <div
                                    className={styles.progressBarFill}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{dailyCalories}</div>
                                    <div className={styles.statLabel}>Consumed</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{Math.max(0, targetCalories - dailyCalories)}</div>
                                    <div className={styles.statLabel}>Remaining</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{targetCalories}</div>
                                    <div className={styles.statLabel}>Target</div>
                                </div>
                            </div>
                        </div>

                        {/* Today's Food History */}
                        <div className={styles.historyCard}>
                            <div className={styles.historyHeader}>
                                <span className={styles.historyTitle}>Today's Food Log</span>
                                <span className={styles.historyDate}>
                                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                            </div>

                            {todayLogs.length > 0 ? (
                                <div className={styles.historyList}>
                                    {todayLogs.map(log => (
                                        <div key={log.id} className={styles.historyItem}>
                                            <div className={styles.historyItemInfo}>
                                                <span className={styles.historyItemName}>{log.food_name}</span>
                                                <div className={styles.historyItemMeta}>
                                                    <span className={styles.historyItemMealType}>{getMealTypeLabel(log.meal_type)}</span>
                                                    <span>{log.calories} kcal</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteLog(log.id)}
                                                className={styles.deleteButton}
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.emptyHistory}>
                                    No foods logged today yet. Go to "Log Food" to add your first meal!
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'log' && <LogFoodView onFoodLogged={fetchDailyLogs} />}
                {activeTab === 'suggestions' && <SuggestionsView onFoodLogged={fetchDailyLogs} />}
                {activeTab === 'analyze' && <AnalyzeView />}
                {activeTab === 'profile' && <ProfileView />}
                {activeTab === 'settings' && <SettingsView />}
            </main>
        </div>
    );
};

export default Dashboard;
