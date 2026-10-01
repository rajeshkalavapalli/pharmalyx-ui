import api from "../../configurations/api-config";

export const createPharmacy = async (pharmacyData) => {
    try {
        const response = await api.post('/app/create-Pharmacy', pharmacyData);
        return response.data;
    } catch (error) {
        console.error("Error creating pharmacy:", error);
        throw error;
    }
};

export const getPharmacies = async () => {
    try {
        const response = await api.get('/app/get-Pharmacies');
        return response.data;
    } catch (error) {
        console.error("Error getting pharmacies:", error);
        throw error;
    }
};  
export const getPharmacyById = async (pharmacyId) => {
    try {
        const response = await api.get(`/app/get-Pharmacy-by-id/${pharmacyId}`);
        return response.data;
    } catch (error) {
        console.error("Error getting pharmacy by ID:", error);
        throw error;
    }
};
export const updatePharmacy = async (pharmacyId, pharmacyData) => {
    try {
        const response = await api.put(`/app/update-Pharmacy/${pharmacyId}`, pharmacyData);
        return response.data;
    } catch (error) {
        console.error("Error updating pharmacy:", error);
        throw error;
    }
};

export const deletePharmacy = async (pharmacyId) => {
    try {
        const response = await api.delete(`/app/delete-Pharmacy/${pharmacyId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting pharmacy:", error);
        throw error;
    }
};  
