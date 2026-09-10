import Cookies from 'js-cookie';
import { decryptData, encryptData } from './cryptoUtils';

const TOKEN_COOKIE_NAME = 'authToken';
const USER_COOKIE_NAME = 'userData';

// Encrypt and store token and user data
export const storeTokenAndUserData = (tokenData, userData) => {
    try {
        if (tokenData) {
            localStorage.setItem('token', tokenData);
        }

        // Sanitize user data to remove large fields like base64 photos
        const sanitizedUserData = { ...userData };
        if (sanitizedUserData.photo && sanitizedUserData.photo.startsWith('data:image')) {
            delete sanitizedUserData.photo;
        }

        if (userData) {
            try {
                localStorage.setItem('user', JSON.stringify(sanitizedUserData));
            } catch (e) {
                console.error('Error saving user data to localStorage:', e);
            }
        }

        const { encryptedData: encryptedToken, salt: tokenSalt, iv: tokenIv } = encryptData(tokenData);
        const { encryptedData: encryptedUser, salt: userSalt, iv: userIv } = encryptData(sanitizedUserData);

        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

        // Store both encrypted data and IV in cookies
        Cookies.set(TOKEN_COOKIE_NAME, JSON.stringify({ encryptedToken, tokenSalt, tokenIv }), {
            secure: isHttps,
            sameSite: 'Strict',
        });

        Cookies.set(USER_COOKIE_NAME, JSON.stringify({ encryptedUser, userSalt, userIv }), {
            secure: isHttps,
            sameSite: 'Strict',
        });
    } catch (error) {
        console.error('Error storing token or user data:', error);
    }
};

// Retrieve and decrypt token and user data
export const retrieveTokenAndUserData = (encrypted = false) => {
    const tokenCookie = Cookies.get(TOKEN_COOKIE_NAME);
    const userCookie = Cookies.get(USER_COOKIE_NAME);

    if (tokenCookie && userCookie) {
        try {
            if (encrypted === true) {
                return { token: tokenCookie, user: userCookie };
            } else {
                const { encryptedToken, tokenSalt, tokenIv } = JSON.parse(tokenCookie);
                const { encryptedUser, userSalt, userIv } = JSON.parse(userCookie);

                const decryptedToken = decryptData(encryptedToken, tokenSalt, tokenIv);
                const decryptedUser = decryptData(encryptedUser, userSalt, userIv);

                if (decryptedToken) {
                    return { token: decryptedToken, user: decryptedUser };
                }
            }
        } catch (error) {
            console.error('tokenManager - Error decrypting cookie data, checking localStorage fallback');
        }
    }

    // Fallback to localStorage
    const lsToken = localStorage.getItem('token');
    if (lsToken) {
        let lsUser = null;
        try {
            const rawUser = localStorage.getItem('user');
            if (rawUser) {
                lsUser = JSON.parse(rawUser);
            }
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
        }
        return { token: lsToken, user: lsUser };
    }

    return { token: null, user: null };
};

// Remove token and user data
export const clearTokenAndUserData = () => {
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    Cookies.remove(TOKEN_COOKIE_NAME, { secure: isHttps, sameSite: 'Strict' });
    Cookies.remove(USER_COOKIE_NAME, { secure: isHttps, sameSite: 'Strict' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

