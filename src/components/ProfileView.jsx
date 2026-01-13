import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import styles from './ProfileView.module.css';

const ProfileView = () => {
    const { user, updateUser, signOut, session } = useUser();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [sendingVerification, setSendingVerification] = useState(false);

    const [tempName, setTempName] = useState(user?.name || '');
    const [tempGoal, setTempGoal] = useState(user?.goal || '');

    // Update local state when user data is loaded
    useEffect(() => {
        if (user) {
            setTempName(user.name || '');
            setTempGoal(user.goal || 'lose');
        }
    }, [user]);

    // Check email verification status
    useEffect(() => {
        const checkVerification = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                setEmailVerified(authUser.email_confirmed_at !== null);
            }
        };
        checkVerification();
    }, [session]);

    if (!user) {
        return (
            <div className={styles.container}>
                <div className={styles.profileCard}>
                    <p className={styles.subtitle}>Cargando perfil...</p>
                </div>
            </div>
        );
    }

    const handleSaveName = () => {
        if (tempName.trim()) {
            updateUser({ name: tempName });
            setIsEditingName(false);
        }
    };

    const handleSaveGoal = () => {
        updateUser({ goal: tempGoal });
        setIsEditingGoal(false);
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Error al cerrar sesión');
        }
    };

    const handleSendVerification = async () => {
        setSendingVerification(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
            });
            if (error) throw error;
            alert('¡Correo de verificación enviado! Revisa tu bandeja de entrada.');
        } catch (error) {
            console.error('Error sending verification:', error);
            alert('Error al enviar el correo de verificación: ' + error.message);
        } finally {
            setSendingVerification(false);
        }
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona una imagen válida');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('La imagen debe ser menor a 2MB');
            return;
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `profile-pictures/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('profile-pictures')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(filePath);

            await updateUser({ photo_url: publicUrl });
            alert('Foto de perfil actualizada');
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Error al subir la foto. Asegúrate de que el bucket "profile-pictures" exista y sea público.');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("¿Estás SEGURO de que quieres eliminar tu cuenta? Esta acción es irreversible y borrará todos tus datos.")) {
            return;
        }

        try {
            // Call the RPC function which handles all deletion (logs, foods, profile, auth user)
            const { error } = await supabase.rpc('delete_user');

            if (error) throw error;

            // Sign out
            await signOut();
            navigate('/login');
            alert('Tu cuenta ha sido eliminada permanentemente.');

        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Error al eliminar la cuenta: ' + error.message);
        }
    };

    const getGoalLabel = (goal) => {
        switch (goal) {
            case 'lose': return 'Lose Weight';
            case 'maintain': return 'Maintain Weight';
            case 'gain_muscle': return 'Gain Muscle';
            case 'gain_weight': return 'Gain Weight';
            default: return 'Select a Goal';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Your Profile</h2>
                <p className={styles.subtitle}>Manage your personal information and goals.</p>
            </div>

            <div className={styles.profileCard}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatar} onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                        {user.photo_url ? (
                            <img src={user.photo_url} alt="Profile" className={styles.avatarImg} />
                        ) : (
                            <span className={styles.avatarPlaceholder}>
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                        )}
                        <div className={styles.avatarOverlay}>
                            <span>📷</span>
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />
                    <p className={styles.changePhotoText}>Click to change photo</p>
                </div>

                <div className={styles.infoSection}>
                    {/* Name Field */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Name</label>
                        <div className={styles.inputWrapper}>
                            {isEditingName ? (
                                <div className={styles.editMode}>
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className={styles.input}
                                        autoFocus
                                    />
                                    <button onClick={handleSaveName} className={styles.saveButton}>Save</button>
                                    <button onClick={() => setIsEditingName(false)} className={styles.cancelButton}>Cancel</button>
                                </div>
                            ) : (
                                <div className={styles.displayMode}>
                                    <span className={styles.value}>{user.name || 'Guest'}</span>
                                    <button onClick={() => setIsEditingName(true)} className={styles.editButton}>
                                        <svg className={styles.editIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Email</label>
                        <div className={styles.inputWrapper}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span className={styles.value}>{user.email}</span>
                                {emailVerified ? (
                                    <span style={{
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        color: '#22c55e',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.75rem',
                                        fontWeight: '600'
                                    }}>
                                        ✓ Verificado
                                    </span>
                                ) : (
                                    <button
                                        onClick={handleSendVerification}
                                        disabled={sendingVerification}
                                        style={{
                                            background: 'var(--color-primary)',
                                            color: '#000',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            border: 'none',
                                            cursor: sendingVerification ? 'not-allowed' : 'pointer',
                                            opacity: sendingVerification ? 0.7 : 1
                                        }}
                                    >
                                        {sendingVerification ? 'Enviando...' : 'Verificar correo'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Goal Field */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Current Goal</label>
                        <div className={styles.inputWrapper}>
                            {isEditingGoal ? (
                                <div className={styles.editMode}>
                                    <select
                                        value={tempGoal}
                                        onChange={(e) => setTempGoal(e.target.value)}
                                        className={styles.select}
                                    >
                                        <option value="lose">Lose Weight</option>
                                        <option value="maintain">Maintain Weight</option>
                                        <option value="gain_muscle">Gain Muscle</option>
                                        <option value="gain_weight">Gain Weight</option>
                                    </select>
                                    <button onClick={handleSaveGoal} className={styles.saveButton}>Save</button>
                                    <button onClick={() => setIsEditingGoal(false)} className={styles.cancelButton}>Cancel</button>
                                </div>
                            ) : (
                                <div className={styles.displayMode}>
                                    <span className={styles.value}>{getGoalLabel(user.goal)}</span>
                                    <button onClick={() => setIsEditingGoal(true)} className={styles.editButton}>
                                        <svg className={styles.editIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actionButtons}>
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            Cerrar Sesión
                        </button>

                        <button onClick={handleDeleteAccount} className={styles.deleteButton}>
                            Eliminar Cuenta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
