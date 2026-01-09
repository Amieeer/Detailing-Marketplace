import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { token, user } = useContext(AuthContext);

    useEffect(() => {
        let newSocket;

        if (token && user) {
            // Use api.defaults.baseURL or fallback
            // Note: api.defaults.baseURL might be undefined if not set yet, but we set it in api.js
            const baseUrl = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';

            newSocket = io(baseUrl, {
                query: { token },
                transports: ['websocket'],
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });

            setSocket(newSocket);
        }

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [token, user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
