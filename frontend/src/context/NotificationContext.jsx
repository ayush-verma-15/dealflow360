import React, { createContext, useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

export const NotificationContext = createContext({ notify: () => {} });
export const NotificationProvider = ({ children }) => {
	const [notifications, setNotifications] = useState([]);
	const notify = useCallback((message, type = 'success') => { setNotifications((items) => [{ id: Date.now(), message, type }, ...items].slice(0, 20)); toast[type]?.(message); }, []);
	const value = useMemo(() => ({ notifications, notify }), [notifications, notify]);
	return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
