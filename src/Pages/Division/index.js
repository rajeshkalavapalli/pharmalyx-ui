import api from "../../configurations/api-config";

export const  createDivision = async(DivisionPayload)=>{
   const response = await api.post('/app/create-division', DivisionPayload)
    return response.data
}

export const getDivisions = async()=>{
    const response = await api.get('/app/get-divisions')
    return response.data

}