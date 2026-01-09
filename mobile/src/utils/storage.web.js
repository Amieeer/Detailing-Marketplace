// Web-compatible storage using localStorage
export const storage = {
    async getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error('Error getting item from localStorage:', e);
            return null;
        }
    },

    async setItem(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error('Error setting item in localStorage:', e);
        }
    },

    async removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing item from localStorage:', e);
        }
    }
};
