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