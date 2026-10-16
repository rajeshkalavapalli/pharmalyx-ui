import api from "../../configurations/api-config";

export const getConfigurationSummary = async () => {
    const response = await api.get('/app/configuration/summary');
    return response.data;
};
