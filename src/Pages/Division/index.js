import api from "../../configurations/api-config";

export const  createDivision = async(DivisionPayload)=>{
   const response = await api.post('/app/create-division', DivisionPayload)
    return response.data
}

export const getDivisions = async()=>{
    const response = await api.get('/app/get-divisions')
    return response.data

}

export const updateDivision = async (divisionId, payload) => {
    const response = await api.put(`/app/update-division/${divisionId}`, payload);
    return response.data;
};

export const deleteDivision = async (divisionId) => {
    const response = await api.delete(`/app/delete-division/${divisionId}`);
    return response.data;
};