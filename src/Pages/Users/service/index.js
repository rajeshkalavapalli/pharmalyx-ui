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