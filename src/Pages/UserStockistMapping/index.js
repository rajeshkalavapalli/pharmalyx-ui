import api from "../../configurations/api-config";

export const getUsers = async () => {
    const response = await api.get('/app/get-users')
    return response.data
}

export const getStockist = async () => {
    const response = await api.get('/app/get-stockists');
    return response.data;
};

export const getUserStockistMappings = async () => {
    const response = await api.get('/app/get-user-stockist-mappings');
    return response.data;
};

export const userStockistMapping = async (payload) => {
    const response = await api.post('/app/create-user-stockist-mapping', payload)
    return response.data
}

export const deleteUserStockistMappings = async (payload) => {
    const response = await api.delete('/app/delete-user-stockist-mappings', { data: payload });
    return response.data;
};

export const updateUserStockistMapping = async (payload) => {
    const response = await api.put('/app/update-user-stockist-mapping', payload);
    return response.data;
};
