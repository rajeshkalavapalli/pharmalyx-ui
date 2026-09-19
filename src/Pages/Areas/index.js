import api from "../../configurations/api-config";

export const getcountry = async ()=>{
    const response = await api.get('app/getcountries')
    console.log('country response', response)
    return response.data
}

export const getstates = async (CountryId) =>{

    const response = await api.get(`app/get-States/${CountryId}`);
    return response.data
}



export const getTerritories = async () =>{
    const response = await api.get(`app/get-territories`)
    return response.data

}