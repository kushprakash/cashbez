import axios from 'axios';
import { AuthContext } from "../hooks/context";
import { notify } from "../messages/Toast";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthData = () => {
    const { login, isLoginned, setProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Use dynamic API service for user data
                const accessToken = localStorage.getItem('token') || "";
                const response = await axios.post('/api/userdata', {}, { headers: { Authorization: `Bearer ${accessToken}`, Token: accessToken } });
                const res = response?.data;
                //console.log('User data fetched:', res);

                if (res && res?.status) {
                    const { user } = res;

                    const token = user?.remember_token;
                    if (!isLoginned) login(token, user);
                    setProfile(user);
                    // Dynamic role-based redirects
                } else {
                    notify.error(res?.message || 'Your session has expired. Please log in to continue.');
                    navigate('/signin');
                }
            } catch (error) {

                console.log('Error fetching user data:', error);

                notify.error('Please log in to start your session.');
                navigate('/signin');
            }
        };
        fetchUser();
    }, []);
    return null;
};

export default AuthData;
