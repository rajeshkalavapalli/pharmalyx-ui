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



export const getTerritorie = async (StateId) => {

    const response =
        await api.get(
            `app/get-territorie/${StateId}`
        );

    return response.data;

};


export const previewAreaCode = async (TerritoryId, AreaName) => {
    const response = await api.get(
        `app/preview-area-code/${TerritoryId}/${AreaName}`
    );

    return response.data;
};

export const createArea = async (AreaPayload) => {
    const response = await api.post('app/create-Area', AreaPayload);
    return response.data;
}

export const getAreas = async () => {
    const response = await api.get('app/get-areas-code');
    return response.data;
};