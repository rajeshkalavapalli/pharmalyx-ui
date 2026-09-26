import api from "../../configurations/api-config";


export const getcountry = async ()=>{
    const response = await api.get('app/getcountries')
    return response.data
}

export const getstates = async (CountryId) =>{

    const response = await api.get(`app/get-States/${CountryId}`);
    return response.data
}

export const createTerriTory = async(TerritoryPayload)=>{
    const response = await api.post('app/create-Territory',TerritoryPayload);
    return response.data
}

export const getTerritorie = async (StateId) => {

    const response =
        await api.get(
            `app/get-territorie/${StateId}`
        );

    return response.data;

};

export const getTerritories = async () =>{
    const response = await api.get(`app/get-territories`)
    return response.data

}