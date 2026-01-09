import api from './api';

const favoriteService = {
    toggleFavorite: async (detailerId) => {
        const response = await api.post('/favorites/toggle', { detailerId });
        return response.data;
    },

    getFavorites: async () => {
        const response = await api.get('/favorites');
        return response.data;
    },

    checkFavorite: async (detailerId) => {
        const response = await api.get(`/favorites/check/${detailerId}`);
        return response.data;
    }
};

export default favoriteService;
