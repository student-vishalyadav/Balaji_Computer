import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => sessionStorage.getItem("balaji_auth_token") || null);
    const [isLoading, setIsLoading] = useState(true);

    // Verify authentication on mount / page reload
    const checkAuthStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await authAPI.getMe();
            if (data?.success && data?.user) {
                setUser(data.user);
            } else {
                setUser(null);
                sessionStorage.removeItem("balaji_auth_token");
                setToken(null);
            }
        } catch (error) {
            // Not authenticated or session expired
            setUser(null);
            sessionStorage.removeItem("balaji_auth_token");
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Handle Login
    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            if (response?.success) {
                if (response.token) {
                    sessionStorage.setItem("balaji_auth_token", response.token);
                    setToken(response.token);
                }
                setUser(response.user);
                return { success: true, user: response.user, msg: response.msg };
            }
            throw new Error(response?.msg || "Login failed");
        } catch (error) {
            throw error;
        }
    };

    // Handle Student Registration / Signup
    const signup = async (userData) => {
        try {
            const response = await authAPI.signup(userData);
            if (response?.success) {
                if (response.token) {
                    sessionStorage.setItem("balaji_auth_token", response.token);
                    setToken(response.token);
                }
                setUser(response.user);
                return { success: true, user: response.user, msg: response.msg };
            }
            throw new Error(response?.msg || "Registration failed");
        } catch (error) {
            throw error;
        }
    };

    // Handle Logout
    const logout = async () => {
        try {
            await authAPI.logout().catch(() => {});
        } finally {
            sessionStorage.removeItem("balaji_auth_token");
            setToken(null);
            setUser(null);
        }
    };

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        refreshProfile: checkAuthStatus,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

