import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId, retries = 3) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116' && retries > 0) {
                    console.log(`Profile not found, retrying... (${retries} left)`);
                    setTimeout(() => fetchProfile(userId, retries - 1), 500);
                    return;
                }

                // If we get a 406 or other auth error, it means the session is invalid/stale
                if (error.status === 406 || error.code === '42501') {
                    console.error('Auth/RLS error fetching profile. Clearing stale session...', error);
                    supabase.auth.signOut().then(() => {
                        setSession(null);
                        setUser(null);
                    });
                }
                console.error('Error fetching profile:', error);
            } else {
                setUser(data);
            }
        } catch (error) {
            console.error('Error in fetchProfile:', error);
        }

        setLoading(false);
    };

    const signUp = async (email, password) => {
        // Clear any stale session first to avoid FK constraint issues from previous deleted accounts
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);

        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        if (error) throw error;

        if (data.session) {
            setSession(data.session);
            await fetchProfile(data.session.user.id);
        }
        return data;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;

        if (data.session) {
            setSession(data.session);
            await fetchProfile(data.session.user.id);
        }
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        setSession(null);
    };

    const updateUser = async (updates) => {
        let userId = user?.id || session?.user?.id;
        let userEmail = user?.email || session?.user?.email;

        // If no user in state, try to get a fresh session
        if (!userId) {
            const { data: { session: freshSession } } = await supabase.auth.getSession();
            if (freshSession) {
                userId = freshSession.user.id;
                userEmail = freshSession.user.email;
                setSession(freshSession);
            }
        }

        if (!userId) {
            console.error('No user or session found for update');
            throw new Error('No se encontró una sesión activa. Por favor, inicia sesión de nuevo.');
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    email: userEmail,
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            setUser(data);
            return data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const value = {
        signUp,
        signIn,
        signOut,
        user,
        updateUser,
        loading,
        session
    };

    return (
        <UserContext.Provider value={value}>
            {!loading && children}
        </UserContext.Provider>
    );
};
