// context.js
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeTokenAndUserData, retrieveTokenAndUserData, clearTokenAndUserData } from '../auth/tokenManager';
import { notify } from '../messages/Toast';
import AuthData from '../auth/AuthData';
import Loader from '../../layouts/Loader.jsx';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [isLoginned, setLogin] = useState(false);
    const [userData, setProfile] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = retrieveTokenAndUserData();
        if (data && data.token) {
            setProfile(data.user);
            setToken(data.token);
            setLogin(true);
        } else {
            setLogin(false);
        }
        setLoading(false);
    }, []);

    const login = (tokenData, userData) => {
        storeTokenAndUserData(tokenData, userData);
        setLogin(true);
        setProfile(userData);
        setToken(tokenData);
        notify.success("SUCCESS !! Logged in successfully.");
        
        // Trigger KYC check after login
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user: userData, token: tokenData } }));
        }, 100);
    };

    const logout = () => {
        clearTokenAndUserData();
        setProfile(null);
        setLogin(false);
        setToken(null);
        notify.success("SUCCESS !! Logged out successfully.");
        navigate("/signin");
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <AuthContext.Provider value={{ isLoginned, userData, token, login, logout , setProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };