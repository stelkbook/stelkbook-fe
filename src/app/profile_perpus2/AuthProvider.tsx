'use client';
import React, { useState, useEffect } from 'react';
import { AuthContext } from './page';


export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Cek token/user dari localStorage atau cookie
        const checkAuth = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const logout = async () => {
        try {
            // Hapus dari localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');

            // Panggil API logout jika perlu
            await fetch('/api/logout', { method: 'POST' });

            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const value = {
        user,
        isLoading,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
