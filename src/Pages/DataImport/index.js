import api from "../../configurations/api-config";

export { errorMessage } from "../Engagement/index";
export { formatDate } from "../Reports/index";

const get = async (url, params) => (await api.get(url, { params })).data;
const post = async (url, body) => (await api.post(url, body)).data;

// Saves a file the server sent (template, rows to fix).
const download = async (url, fallbackName) => {
    const response = await api.get(url, { responseType: "blob" });
    const disposition = response.headers?.["content-disposition"] || "";
    const name = /filename="?([^"]+)"?/.exec(disposition)?.[1] || fallbackName;
    const href = URL.createObjectURL(response.data);
    const link = document.createElement("a");

    link.href = href;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
};

export const getCatalogue = () => get("/app/imports");
export const downloadTemplate = (type) => download(`/app/imports/template/${type}`, `pharmalyx-${type.toLowerCase()}-template.xlsx`);

// The file goes as the raw request body; its name travels in a header.
export const uploadFile = async (type, file, sourceSystem) =>
    (
        await api.post(`/app/imports/${type}/upload`, file, {
            params: { source: sourceSystem || undefined },
            headers: { "Content-Type": "application/octet-stream", "x-file-name": encodeURIComponent(file.name) },
        })
    ).data;

export const getBatch = (batchId) => get(`/app/imports/batches/${batchId}`);
export const checkBatch = (batchId, payload) => post(`/app/imports/batches/${batchId}/check`, payload);
export const downloadIssues = (batchId) => download(`/app/imports/batches/${batchId}/issues.csv`, "rows-to-fix.csv");
export const commitBatch = (batchId) => post(`/app/imports/batches/${batchId}/commit`);
export const undoBatch = (batchId) => post(`/app/imports/batches/${batchId}/undo`);
export const cancelBatch = (batchId) => post(`/app/imports/batches/${batchId}/cancel`);
export const retypeBatch = (batchId, type) => post(`/app/imports/batches/${batchId}/retype`, { type });

export const MAX_FILE_MB = 15;
export const ACCEPT = ".xlsx,.csv,.docx,.pdf";

export const BATCH_STATUS = {
    UPLOADED: { label: "Columns to match", color: "info" },
    CHECKED: { label: "Ready to import", color: "warning" },
    IMPORTED: { label: "Imported", color: "success" },
    UNDONE: { label: "Undone", color: "secondary" },
    CANCELLED: { label: "Cancelled", color: "secondary" },
};

export const ROW_STATUS = {
    READY: { label: "Ready", color: "success" },
    WARNING: { label: "Check", color: "warning" },
    ERROR: { label: "Error", color: "error" },
};

export const ACTION_LABEL = { CREATE: "Create new", UPDATE: "Update existing", SKIP: "Skip" };

// The most recognisable value of a row, for lists ("Dr. Suresh Rao").
export const rowTitle = (row, columnMap) => {
    for (const key of ["name", "userName", "firstName", "code"]) {
        const header = columnMap?.[key];
        if (header && row.values?.[header]) return String(row.values[header]);
    }
    return `Row ${row.rowNumber}`;
};
