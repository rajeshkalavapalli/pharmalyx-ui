import api from "../../configurations/api-config";

export const createStockist = async (stockistData) => {
    try {
        const response = await api.post('/app/create-stockist', stockistData);
        return response.data;
    } catch (error) {
        console.error('Error creating stockist:', error);
        throw error;
    }
};

export const getStockists = async () => {
    try {
        const response = await api.get('/app/get-stockists');
        return response.data;
    } catch (error) {
        console.error('Error getting stockists:', error);
        throw error;
    }
};

export const getStockistById = async (stockistId) => {
    try {
        const response = await api.get(`/app/get-stockist-by-id/${stockistId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting stockist by ID:', error);
        throw error;
    }
};

export const updateStockist = async (stockistId, stockistData) => {
    try {
        const response = await api.put(`/app/update-stockist/${stockistId}`, stockistData);
        return response.data;
    } catch (error) {
        console.error('Error updating stockist:', error);
        throw error;
    }
};

export const deleteStockist = async (stockistId) => {
    try {
        const response = await api.delete(`/app/delete-stockist/${stockistId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting stockist:', error);
        throw error;
    }
};
