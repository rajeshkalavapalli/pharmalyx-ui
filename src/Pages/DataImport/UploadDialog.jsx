import { useRef, useState } from "react";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DescriptionRounded, FileDownloadRounded, UploadFileRounded } from "@mui/icons-material";

import { ACCEPT, MAX_FILE_MB, downloadTemplate, errorMessage, uploadFile } from "./index";

const sizeLabel = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

const fileProblem = (file) => {
    if (/\.(jpe?g|png|gif|bmp|webp|heic|heif|tiff?)$/i.test(file.name)) {
        return "Photos can't be read yet. Export the list from your old app as Excel, CSV, Word or PDF, or type it into our template.";
    }
    if (/\.(xls|doc)$/i.test(file.name)) return "Old .xls and .doc files need to be saved as .xlsx or .docx first.";
    if (!/\.(xlsx|csv|docx|pdf)$/i.test(file.name)) return "Choose an Excel (.xlsx), CSV, Word (.docx) or PDF file.";
    if (file.size > MAX_FILE_MB * 1024 * 1024) return `The file is larger than ${MAX_FILE_MB} MB. Split it into smaller files.`;
    return "";
};

// Pick a file (or drop it), optionally name the previous app, upload.
function UploadDialog({ type, onClose, onUploaded }) {
    const inputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [source, setSource] = useState("");
    const [dragging, setDragging] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const choose = (picked) => {
        if (!picked) return;
        const problem = fileProblem(picked);
        setError(problem);
        setFile(problem ? null : picked);
    };

    const upload = async () => {
        setBusy(true);
        setError("");

        try {
            onUploaded(await uploadFile(type.type, file, source.trim()));
        } catch (err) {
            setError(errorMessage(err, "Couldn't upload the file"));
            setBusy(false);
        }
    };

    return (
        <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={(theme) => ({ px: theme.dialog.paddingX, pt: theme.dialog.paddingY })}>Import {type.label.toLowerCase()}</DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                <Stack spacing={2.5}>
                    <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                        Upload the export from your previous app as it is, or fill in our template. Nothing is saved until you review the check and press Import.
                    </Typography>

                    <Box
                        role="button"
                        tabIndex={0}
                        aria-label="Choose a file to upload"
                        onClick={() => inputRef.current?.click()}
                        onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && inputRef.current?.click()}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={(event) => {
                            event.preventDefault();
                            setDragging(false);
                            choose(event.dataTransfer.files?.[0]);
                        }}
                        sx={(theme) => ({
                            py: theme.dataImport.dropZonePaddingY,
                            px: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                            textAlign: "center",
                            cursor: "pointer",
                            borderRadius: theme.panel.radius,
                            border: theme.dataImport.dropZoneBorder,
                            borderColor: dragging || file ? theme.palette.primary.main : theme.palette.border.strong,
                            backgroundColor: dragging ? alpha(theme.palette.primary.main, theme.tint.selected) : theme.palette.surface.subtle,
                            transition: theme.sidebarLayout.itemTransition,
                            "&:hover, &:focus-visible": { borderColor: theme.palette.primary.main, outline: "none" },
                        })}
                    >
                        {file ? (
                            <>
                                <DescriptionRounded sx={(theme) => ({ fontSize: theme.dataImport.dropIconSize, color: theme.palette.primary.main })} />
                                <Typography variant="subtitle2">{file.name}</Typography>
                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    {sizeLabel(file.size)} · click to choose a different file
                                </Typography>
                            </>
                        ) : (
                            <>
                                <UploadFileRounded sx={(theme) => ({ fontSize: theme.dataImport.dropIconSize, color: theme.palette.text.secondary })} />
                                <Typography variant="subtitle2">Drop your file here, or click to choose</Typography>
                                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    Excel, CSV, Word or PDF (the list must be in a table), up to {MAX_FILE_MB} MB
                                </Typography>
                            </>
                        )}
                        <input
                            ref={inputRef}
                            type="file"
                            accept={ACCEPT}
                            hidden
                            onChange={(event) => {
                                choose(event.target.files?.[0]);
                                event.target.value = "";
                            }}
                        />
                    </Box>

                    <TextField
                        label="Previous app (optional)"
                        placeholder="e.g. the MR app you used before"
                        value={source}
                        onChange={(event) => setSource(event.target.value)}
                        helperText="Pharmalyx remembers how this app's columns match, so the next file from it is matched for you."
                        slotProps={{ htmlInput: { maxLength: 100 } }}
                    />

                    {error && (
                        <Typography variant="body2" role="alert" sx={(theme) => ({ color: theme.palette.error.main })}>
                            {error}
                        </Typography>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={(theme) => ({ px: theme.dialog.paddingX, pb: theme.dialog.paddingY, justifyContent: "space-between", gap: 1, flexWrap: "wrap" })}>
                <Button startIcon={<FileDownloadRounded />} onClick={() => downloadTemplate(type.type).catch(() => setError("Couldn't download the template."))} disabled={busy}>
                    Template
                </Button>
                <Stack direction="row" spacing={1}>
                    <Button onClick={onClose} disabled={busy}>
                        Cancel
                    </Button>
                    <Button variant="contained" startIcon={<UploadFileRounded />} disabled={!file || busy} onClick={upload}>
                        {busy ? "Reading file…" : "Upload and match"}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}

export default UploadDialog;
