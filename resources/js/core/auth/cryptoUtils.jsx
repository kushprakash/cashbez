import CryptoJS from 'crypto-js';
import { SECRET_KEY } from '../config';


// Helper function to derive a key using PBKDF2 (Key derivation function)
const deriveKey = (combinedKey, salt) => {
    return CryptoJS.PBKDF2(combinedKey, salt, {
        keySize: 256 / 32, // AES-256 key
        iterations: 10000 // Adjust the number of iterations based on security/performance trade-offs
    });
};

// Function to generate a random salt
const generateSalt = () => {
    return CryptoJS.lib.WordArray.random(128 / 8); // 128-bit salt
};

// Function to generate a random IV
const generateIV = () => {
    return CryptoJS.lib.WordArray.random(128 / 8); // 128-bit IV
};

// Encrypt data
export const encryptData = (data) => {
    // console.log("SECRET_KEY:", SECRET_KEY);
    try {
        const iv = generateIV(); // Generate a random IV
        const salt = generateSalt(); // Generate a random salt
        const key = deriveKey(SECRET_KEY, salt); // Derive a strong key with PBKDF2

        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
            iv: iv, // Pass the IV here
            mode: CryptoJS.mode.CBC, // Optional: Explicitly set the AES mode
            padding: CryptoJS.pad.Pkcs7 // Optional: Explicitly set the padding scheme
        }).toString();

        // Attach the salt and IV with the ciphertext to decrypt later (convert both to Base64)
        return {
            encryptedData,
            salt: salt.toString(CryptoJS.enc.Base64), // Salt for key derivation
            iv: iv.toString(CryptoJS.enc.Base64) // IV for AES decryption
        };
    } catch (error) {
        console.error('Error encrypting data:', error);
        throw new Error('Encryption failed');
    }
};

// Decrypt data
export const decryptData = (encryptedDataBase64, saltBase64, ivBase64) => {
    try {
        const encryptedData = encryptedDataBase64;
        const salt = CryptoJS.enc.Base64.parse(saltBase64);
        const iv = CryptoJS.enc.Base64.parse(ivBase64);
        const key = deriveKey(SECRET_KEY, salt);  // Ensure this matches encryption

        const bytes = CryptoJS.AES.decrypt(encryptedData, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

        // If decryption failed, bytes may be empty
        if (!decryptedData) {
            throw new Error('Decrypted data is empty. Possible causes: incorrect key, IV, or corrupted data.');
        }

        // Parse decrypted data as JSON if applicable
        const parsedData = JSON.parse(decryptedData);
        return parsedData;
    } catch (error) {
        console.error('Error decrypting data:', error);
        throw new Error('Decryption failed');
    }
};



// Encrypt data for API requests using authToken and SECRET_KEY
export const encryptDataForAPI = (data, authToken) => {
    try {
        const iv = generateIV(); // Generate random IV
        const combinedKey = `${SECRET_KEY}${authToken}`; // Combine the secret key with the authToken
        const key = deriveKey(combinedKey, iv); // Derive a key from the combined key and IV
        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), key, { iv }).toString();

        // Attach IV with the ciphertext for decryption
        return { encryptedData, iv: iv.toString(CryptoJS.enc.Base64) };
    } catch (error) {
        console.error('Error encrypting data for API:', error);
        throw new Error('Encryption failed');
    }
};

// Decrypt data from API responses using authToken and SECRET_KEY
export const decryptDataFromAPI = (encryptedData, ivBase64, authToken) => {
    try {
        const iv = CryptoJS.enc.Base64.parse(ivBase64); // Convert Base64 IV back to WordArray
        const combinedKey = `${SECRET_KEY}${authToken}`;
        const key = deriveKey(combinedKey, iv); // Derive the key from combinedKey and IV

        const bytes = CryptoJS.AES.decrypt(encryptedData, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

        // If decryption failed, bytes may be empty
        if (!decryptedData) {
            throw new Error('Decrypted data is empty. Possible causes: incorrect key, IV, or corrupted data.');
        }

        // Parse decrypted data as JSON if applicable
        const parsedData = JSON.parse(decryptedData);
        return parsedData;
    } catch (error) {
        console.error('Error decrypting data from API:', error);
        throw new Error('Decryption failed');
    }
};

// Encrypt ID for API requests using authToken and SECRET_KEY
export const encryptIdForAPI = (id, authToken) => {
    try {
        const iv = generateIV(); // Generate random IV
        const combinedKey = `${SECRET_KEY}${authToken}`;
        const key = deriveKey(combinedKey, iv); // Derive key from combinedKey and IV
        const encryptedId = CryptoJS.AES.encrypt(id, key, iv).toString();

        // Attach IV for decryption
        return { encryptedId, iv: iv.toString(CryptoJS.enc.Base64) };
    } catch (error) {
        console.error('Error encrypting ID for API:', error);
        throw new Error('Encryption failed');
    }
};

// Decrypt ID from API responses using authToken and SECRET_KEY
export const decryptIdFromAPI = (encryptedId, ivBase64, authToken) => {
    try {
        const iv = CryptoJS.enc.Base64.parse(ivBase64); // Convert Base64 IV back to WordArray
        const combinedKey = `${SECRET_KEY}${authToken}`;
        const key = deriveKey(combinedKey, iv); // Derive key from combinedKey and IV
        const bytes = CryptoJS.AES.decrypt(encryptedId, key, { iv });
        const decryptedId = bytes.toString(CryptoJS.enc.Utf8);

        return decryptedId;
    } catch (error) {
        console.error('Error decrypting ID from API:', error);
        throw new Error('Decryption failed');
    }
};