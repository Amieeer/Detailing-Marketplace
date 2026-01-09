import api from './api';

const vehicleService = {
    getMyVehicles: async () => {
        const response = await api.get('/vehicles');
        return response.data;
    },

    addVehicle: async (vehicleData) => {
        const response = await api.post('/vehicles', vehicleData);
        return response.data;
    },

    deleteVehicle: async (id) => {
        const response = await api.delete(`/vehicles/${id}`);
        return response.data;
    }
};

export default vehicleService;
