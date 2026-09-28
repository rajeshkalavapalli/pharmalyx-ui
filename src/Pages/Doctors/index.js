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