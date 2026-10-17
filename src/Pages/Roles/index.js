import api from "../../configurations/api-config";

export const getRoles = async () => (await api.get('/app/roles')).data;

export const getRolePermissions = async (roleId) => (await api.get(`/app/roles/${roleId}/permissions`)).data;

export const saveRolePermissions = async (roleId, permissions) =>
    (await api.put(`/app/roles/${roleId}/permissions`, { permissions })).data;

export const getRoleUsers = async () => (await api.get('/app/roles/users')).data;

export const assignUserRole = async (userId, roleId) =>
    (await api.put(`/app/roles/users/${userId}`, { RoleId: roleId })).data;

export const errorMessage = (error, fallback) => {
    const data = error.response?.data;
    const message = data?.message || error.message || fallback;

    return data?.error && data.error !== message ? `${message} (${data.error})` : message;
};

// Administrators always keep access to the roles screen (enforced on the server too).
export const LOCKED = { role: 'ADMIN', permissions: ['roles.view', 'roles.edit'] };

export const ACTIONS = [
    { code: 'view', label: 'View' },
    { code: 'create', label: 'Create' },
    { code: 'edit', label: 'Edit' },
    { code: 'delete', label: 'Delete' },
    { code: 'approve', label: 'Approve' },
];
