import api from "../../configurations/api-config";

export const createDoctor = async (doctorPayload) => {
    const response = await api.post('app/create-doctor', doctorPayload);
    return response.data;
}

export const getDoctors = async () => {
    const response = await api.get('app/get-doctors');
    return response.data;
}
