import Cookies from 'js-cookie';
import { decryptData, encryptData } from './cryptoUtils';

const TOKEN_COOKIE_NAME = 'authToken';
const USER_COOKIE_NAME = 'userData';

// Encrypt and store token and user data
export const storeTokenAndUserData = (tokenData, userData) => {
    try {
        const { encryptedData: encryptedToken, salt: tokenSalt, iv: tokenIv } = encryptData(tokenData);

        // Sanitize user data to remove large fields like base64 photos
        const sanitizedUserData = { ...userData };
        if (sanitizedUserData.photo && sanitizedUserData.photo.startsWith('data:image')) {
            delete sanitizedUserData.photo;
        }

        const { encryptedData: encryptedUser, salt: userSalt, iv: userIv } = encryptData(sanitizedUserData);

        // Store both encrypted data and IV in cookies
        Cookies.set(TOKEN_COOKIE_NAME, JSON.stringify({ encryptedToken, tokenSalt, tokenIv }), {
            secure: true,
            sameSite: 'Strict',
        });

        Cookies.set(USER_COOKIE_NAME, JSON.stringify({ encryptedUser, userSalt, userIv }), {
            secure: true,
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

    console.log('tokenManager - userCookie:', userCookie ? 'Present' : 'Missing');
    // Commented out to reduce noise, but useful if needed.

    if (tokenCookie && userCookie) {
        try {

            if (encrypted === true) {

                const token = tokenCookie;
                const user = userCookie;

                return { token: token, user: user };

            } else {

                const { encryptedToken, tokenSalt, tokenIv } = JSON.parse(tokenCookie);
                const { encryptedUser, userSalt, userIv } = JSON.parse(userCookie);

                const decryptedToken = decryptData(encryptedToken, tokenSalt, tokenIv);
                const decryptedUser = decryptData(encryptedUser, userSalt, userIv);

                // console.log('tokenManager - Decrypted token length:', decryptedToken ? decryptedToken.length : 'null');

                return { token: decryptedToken, user: decryptedUser };

            }


        } catch (error) {
            // console.error('tokenManager - Error decrypting token or user data:', error);
            // console.error('tokenManager - Cookie content (token):', tokenCookie);
            return { token: null, user: null };
        }
    } else {
        console.warn('tokenManager - Cookies missing. Token:', !!tokenCookie, 'User:', !!userCookie);
    }

    return { token: null, user: null };
};

// Remove token and user data
export const clearTokenAndUserData = () => {
    Cookies.remove(TOKEN_COOKIE_NAME, { secure: true, sameSite: 'Strict' });
    Cookies.remove(USER_COOKIE_NAME, { secure: true, sameSite: 'Strict' });
};
