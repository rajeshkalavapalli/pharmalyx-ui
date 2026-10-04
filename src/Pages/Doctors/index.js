import api from "../../configurations/api-config";

export const getAreasByTerritory = async (TerritoryId) => {
    try{
        const response = await api.get(`app/get-areas-by-territory/${TerritoryId}`);
        return response.data;
    }catch(err){
        console.log("error in get areas by territory", err)
        throw err;
    }
}

export const createDoctor = async (doctorPayload) => {
    const response = await api.post('app/create-doctor', doctorPayload);
    return response.data;
}

export const getDoctors = async () => {
    const response = await api.get('app/get-doctors');
    return response.data;
}

export const updateDoctor = async (doctorId, payload) => {
    const response = await api.put(`app/update-doctor/${doctorId}`, payload);
    return response.data;
}

export const deleteDoctor = async (doctorId) => {
    const response = await api.delete(`app/delete-doctor/${doctorId}`);
    return response.data;
}
