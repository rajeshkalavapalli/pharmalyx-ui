import api from "../../../src/configurations/api-config";

export const getUsers = async()=>{

    const response = await api.get('/app/get-users')
    return response.data
}