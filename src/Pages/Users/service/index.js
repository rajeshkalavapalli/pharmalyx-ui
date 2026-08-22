import api from "../../../configurations/api-config";

export const getDesignation = async() =>{
    const response = await api.get('/app/designation')
    return response.data
};