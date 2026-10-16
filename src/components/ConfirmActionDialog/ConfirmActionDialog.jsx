import { useState } from "react";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// Confirmation with an optional remarks field.
// remarks: "none" | "optional" | "required". `color` is a palette key.
// Mount it fresh per use (conditionally or with `key`) so the remarks start empty.
function ConfirmActionDialog({
    icon: Icon,
    color = "primary",
    title,
    message,
    confirmLabel = "Confirm",
    remarks: remarksMode = "none",
    remarksLabel,
    remarksLimit = 1000,
    busy = false,
    onClose,
    onConfirm,
}) {
    const [remarks, setRemarks] = useState("");

    const needsRemarks = remarksMode === "required" && !remarks.trim();

    return (
        <Dialog
            open
            onClose={busy ? undefined : onClose}
            fullWidth
            maxWidth="xs"
            slotProps={{
                paper: {
                    sx: (theme) => ({ backgroundColor: theme.palette.background.paper }),
                },
            }}
        >
            <DialogTitle
                component="div"
                sx={(theme) => ({
                    px: theme.dialog.paddingX,
                    pt: theme.dialog.paddingY,
                    pb: 1,
                })}
            >
                {Icon && (
                    <Box
                        sx={(theme) => ({
                            width: theme.stat.iconSize,
                            height: theme.stat.iconSize,
                            mb: 2,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: theme.stat.iconRadius,
                            color: theme.palette[color].main,
                            backgroundColor: alpha(theme.palette[color].main, theme.tint.soft),
                        })}
                    >
                        <Icon sx={(theme) => ({ fontSize: theme.stat.iconFontSize })} />
                    </Box>
                )}

                <Typography variant="h5" component="h2">
                    {title}
                </Typography>
            </DialogTitle>

            <DialogContent sx={(theme) => ({ px: theme.dialog.paddingX })}>
                {message && (
                    <Typography
                        variant="body2"
                        sx={(theme) => ({ color: theme.palette.text.secondary })}
                    >
                        {message}
                    </Typography>
                )}

                {remarksMode !== "none" && (
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        minRows={3}
                        label={
                            remarksLabel ||
                            (remarksMode === "required" ? "Reason" : "Comment (optional)")
                        }
                        required={remarksMode === "required"}
                        value={remarks}
                        onChange={(event) => setRemarks(event.target.value.slice(0, remarksLimit))}
                        helperText={`${remarks.length}/${remarksLimit}`}
                        slotProps={{ formHelperText: { sx: { textAlign: "right" } } }}
                        sx={{ mt: 2.5 }}
                    />
                )}
            </DialogContent>

            <DialogActions
                sx={(theme) => ({
                    px: theme.dialog.paddingX,
                    pb: theme.dialog.paddingY,
                    gap: 1,
                })}
            >
                <Button variant="outlined" onClick={onClose} disabled={busy}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    color={color}
                    disabled={busy || needsRemarks}
                    onClick={() => onConfirm(remarks.trim())}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmActionDialog;
