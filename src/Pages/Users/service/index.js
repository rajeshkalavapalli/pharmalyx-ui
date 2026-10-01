import api from "../../../configurations/api-config";

export const getDesignation = async() =>{
    const response = await api.get('/app/designation')
    return response.data
};

export const createUser = async(userData)=>{
    const response = await api.post('/app/create-user',userData)
    return response.data
}

export const getUsers = async()=>{

    const response = await api.get('/app/get-users')
    return response.data
}

export const updateUser = async (userData) => {
    const response = await api.put('/app/update-user', userData);
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/app/delete-user/${userId}`);
    return response.data;
};