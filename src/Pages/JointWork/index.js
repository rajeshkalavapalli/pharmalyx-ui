import api from "../../configurations/api-config";

export const getJointWork = async (month) => (await api.get("/app/joint-work", { params: { month } })).data;
export const getPeople = async () => (await api.get("/app/people")).data;
export const askJointWork = async (workDate, colleagueIds) => (await api.post("/app/joint-work", { WorkDate: workDate, ColleagueUserIds: colleagueIds })).data;
export const answerJointWork = async (id, accept, note) => (await api.post(`/app/joint-work/${id}/respond`, { Accept: accept, Note: note || null })).data;
export const saveJointFeedback = async (id, rating, notes) => (await api.post(`/app/joint-work/${id}/feedback`, { Rating: rating, Notes: notes || null })).data;
export const cancelJointWork = async (id) => (await api.delete(`/app/joint-work/${id}`)).data;

export const STATUS = {
    PENDING: { label: "Waiting", color: "warning" },
    CONFIRMED: { label: "Confirmed", color: "success" },
    DECLINED: { label: "Declined", color: "secondary" },
};
