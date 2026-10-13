import api from "../../configurations/api-config";



export const getTerritories = async () => {
    const response = await api.get('/app/get-territories');
    return response.data;
};

export const getAreas = async () => {
    const response = await api.get('/app/get-areas-code');
    return response.data;
};

// The API identifies the acting user from this header; login does not store it yet.
const actingUserHeaders = () => {
    const userId = localStorage.getItem('userId');
    return userId ? { 'x-user-id': userId } : {};
};

export const getCurrentUserId = () => localStorage.getItem('userId');

export const getTourPlan = async (planMonth, userId) => {
    const response = await api.get('/app/tourplan', {
        params: { planMonth, userId },
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const saveTourPlan = async (payload) => {
    const response = await api.post('/app/tourplan', payload, {
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const approveTourPlan = async (tourPlanId) => {
    const response = await api.post(`/app/tourplan/${tourPlanId}/approve`, null, {
        headers: actingUserHeaders(),
    });
    return response.data;
};

export const rejectTourPlan = async (tourPlanId) => {
    const response = await api.post(`/app/tourplan/${tourPlanId}/reject`, null, {
        headers: actingUserHeaders(),
    });
    return response.data;
};

