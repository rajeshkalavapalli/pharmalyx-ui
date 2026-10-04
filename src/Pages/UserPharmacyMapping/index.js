import api from "../../configurations/api-config";

export const getUsers = async () => {
    const response = await api.get('/app/get-users')
    return response.data
}

export const getPharmacy = async () => {
    const response = await api.get('/app/get-Pharmacies');
    return response.data;
};

export const getUserPharmacyMappings = async () => {
    const response = await api.get('/app/get-user-pharmacy-mappings');
    return response.data;
};

export const userPharmacyMapping = async (payload) => {
    const response = await api.post('/app/create-user-pharmacy-mapping', payload)
    return response.data
}

export const deleteUserPharmacyMappings = async (payload) => {
    const response = await api.delete('/app/delete-user-pharmacy-mappings', { data: payload });
    return response.data;
};

export const updateUserPharmacyMapping = async (payload) => {
    const response = await api.put('/app/update-user-pharmacy-mapping', payload);
    return response.data;
};
