import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      withCredentials: true
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinDeal = (dealId) => {
    if (socket && isConnected) {
      socket.emit('join-deal', dealId);
    }
  };

  const leaveDeal = (dealId) => {
    if (socket && isConnected) {
      socket.emit('leave-deal', dealId);
    }
  };

  const onStatusChange = (callback) => {
    if (socket) {
      socket.on('status-changed', callback);
      return () => socket.off('status-changed', callback);
    }
  };

  const onNegotiationUpdate = (callback) => {
    if (socket) {
      socket.on('negotiation-changed', callback);
      return () => socket.off('negotiation-changed', callback);
    }
  };

  const value = {
    socket,
    isConnected,
    joinDeal,
    leaveDeal,
    onStatusChange,
    onNegotiationUpdate
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};