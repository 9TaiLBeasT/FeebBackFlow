"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { errorLogger } from "@/lib/errorLogging";

// Types
export interface AppState {
  user: User | null;
  theme: "light" | "dark";
  isLoading: boolean;
  error: Error | null;
}

type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: Error | null };

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Initial state
const initialState: AppState = {
  user: null,
  theme: "dark",
  isLoading: true,
  error: null,
};

// Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Provider Component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        dispatch({ type: "SET_USER", payload: user });
      } catch (error) {
        errorLogger.logError(error as Error, {
          context: "AppProvider:initAuth",
        });
        dispatch({ type: "SET_ERROR", payload: error as Error });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch({ type: "SET_USER", payload: session?.user ?? null });
    });

    initAuth();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      dispatch({ type: "SET_USER", payload: null });
    } catch (error) {
      errorLogger.logError(error as Error, { context: "AppProvider:signOut" });
      dispatch({ type: "SET_ERROR", payload: error as Error });
    }
  };

  const clearError = () => {
    dispatch({ type: "SET_ERROR", payload: null });
  };

  const value = {
    ...state,
    dispatch,
    signOut,
    clearError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

// Utility hooks
export function useUser() {
  const { user } = useApp();
  return user;
}

export function useTheme() {
  const { theme, dispatch } = useApp();
  const toggleTheme = () => {
    dispatch({
      type: "SET_THEME",
      payload: theme === "light" ? "dark" : "light",
    });
  };
  return { theme, toggleTheme };
}

export function useLoading() {
  const { isLoading } = useApp();
  return isLoading;
}

export function useError() {
  const { error, clearError } = useApp();
  return { error, clearError };
}
