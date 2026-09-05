import React, { createContext, useContext, useMemo, useState } from 'react';

const ThemeContext = createContext({ mode: 'light', toggleTheme: () => {} });
export const ThemeProvider = ({ children }) => { const [mode, setMode] = useState(localStorage.getItem('theme') || 'light'); const toggleTheme = () => setMode((current) => { const next = current === 'light' ? 'dark' : 'light'; localStorage.setItem('theme', next); return next; }); const value = useMemo(() => ({ mode, toggleTheme }), [mode]); return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>; };
export const useTheme = () => useContext(ThemeContext);
