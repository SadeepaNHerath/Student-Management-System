// Image path utility
import {ASSETS_BASE_URL} from './constants.js';

/**
 * Get the proper path for an image
 * @param {string} imageName - The image filename
 * @returns {string} The full path to the image
 */
export function getImagePath(imageName) {
    return `${ASSETS_BASE_URL}/${imageName}`;
}

/**
 * Get a default profile picture path
 * @returns {string} The path to the default profile image
 */
export function getDefaultProfilePic() {
    return getImagePath('profile-pic.png');
}

/**
 * Format a date string to a user-friendly format
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted date
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Parse JWT token and extract user information
 * @param {string} token - The JWT token
 * @returns {Object|null} The decoded token payload or null if invalid
 */
export function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

/**
 * Check if a user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const payload = parseJwt(token);
        const expiration = payload.exp * 1000; // Convert to milliseconds

        if (Date.now() >= expiration) {
            // Token expired
            localStorage.removeItem('token');
            return false;
        }

        return true;
    } catch (e) {
        return false;
    }
}
