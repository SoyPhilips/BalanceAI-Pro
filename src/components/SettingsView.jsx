import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import styles from './SettingsView.module.css';

const SettingsView = () => {
    const { user } = useUser();
    const [notifications, setNotifications] = useState(true);
    const [useMetric, setUseMetric] = useState(true);

    // Password Change State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handlePasswordChange = async () => {
        setPasswordError('');

        if (newPassword.length < 6) {
            setPasswordError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Las contraseñas no coinciden');
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            alert('Contraseña actualizada exitosamente');
            setIsChangingPassword(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error updating password:', error);
            setPasswordError('Error al actualizar la contraseña');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Settings</h2>
                <p className={styles.subtitle}>Manage your app preferences.</p>
            </div>

            <div className={styles.grid}>
                {/* Account Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Account</h3>
                    <div className={styles.card}>
                        <div className={styles.row}>
                            <div className={styles.rowInfo}>
                                <span className={styles.label}>Email</span>
                                <span className={styles.value}>{user.email}</span>
                            </div>
                        </div>
                        <div className={styles.divider}></div>

                        {/* Password Row */}
                        {!isChangingPassword ? (
                            <div className={styles.row}>
                                <div className={styles.rowInfo}>
                                    <span className={styles.label}>Password</span>
                                    <span className={styles.value}>••••••••</span>
                                </div>
                                <button
                                    className={styles.actionButton}
                                    onClick={() => setIsChangingPassword(true)}
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <div className={styles.passwordForm}>
                                <div className={styles.passwordInputGroup}>
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={styles.input}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                                {passwordError && <span className={styles.errorText}>{passwordError}</span>}
                                <div className={styles.passwordActions}>
                                    <button onClick={handlePasswordChange} className={styles.saveButton}>Update</button>
                                    <button
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setNewPassword('');
                                            setConfirmPassword('');
                                            setPasswordError('');
                                        }}
                                        className={styles.cancelButton}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preferences Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Preferences</h3>
                    <div className={styles.card}>
                        <div className={styles.row}>
                            <div className={styles.rowInfo}>
                                <span className={styles.label}>Notifications</span>
                                <span className={styles.subLabel}>Receive daily reminders</span>
                            </div>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={notifications}
                                    onChange={(e) => setNotifications(e.target.checked)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.row}>
                            <div className={styles.rowInfo}>
                                <span className={styles.label}>Units</span>
                                <span className={styles.subLabel}>{useMetric ? 'Metric (kg, cm)' : 'Imperial (lb, ft)'}</span>
                            </div>
                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={useMetric}
                                    onChange={(e) => setUseMetric(e.target.checked)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>About</h3>
                    <div className={styles.card}>
                        <div className={styles.row}>
                            <span className={styles.label}>Version</span>
                            <span className={styles.value}>1.0.0</span>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.row}>
                            <span className={styles.label}>Privacy Policy</span>
                            <svg className={styles.arrowIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.row}>
                            <span className={styles.label}>Terms of Service</span>
                            <svg className={styles.arrowIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default SettingsView;
