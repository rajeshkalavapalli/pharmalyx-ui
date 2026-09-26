import api from "../../configurations/api-config";

export const getUsers = async()=>{

    const response = await api.get('/app/get-users')
    return response.data
}

export const getTerritories = async () => {
    const response = await api.get('/app/get-territories');
    return response.data;
};

export const getAreas = async () => {
    const response = await api.get('/app/get-areas-code');
    return response.data;
};

export const getUserAreaMappings = async () => {
    const response = await api.get('/app/get-user-area-mappings');
    return response.data;
};

export const userAreaMaping = async (payload)=>{
    const response = await api.post('app/create-user-area-mapping', payload)
    return response.data 
}