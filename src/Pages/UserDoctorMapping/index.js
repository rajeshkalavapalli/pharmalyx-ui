import api from "../../configurations/api-config";

export const getUsers = async () => {
    const response = await api.get('/app/get-users')
    return response.data
}

export const getDoctors = async () => {
    const response = await api.get('/app/get-doctors');
    return response.data;
};

export const getUserDoctorMappings = async () => {
    const response = await api.get('/app/get-user-doctor-mappings');
    return response.data;
};

export const userDoctorMapping = async (payload) => {
    const response = await api.post('/app/create-user-doctor-mapping', payload)
    return response.data
}

export const deleteUserDoctorMappings = async (payload) => {
    const response = await api.delete('/app/delete-user-doctor-mappings', { data: payload });
    return response.data;
};

export const updateUserDoctorMapping = async (payload) => {
    const response = await api.put('/app/update-user-doctor-mapping', payload);
    return response.data;
};