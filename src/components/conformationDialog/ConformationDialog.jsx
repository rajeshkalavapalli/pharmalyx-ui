import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";


const ConfirmationDialog = ({
    open,
    title = "Confirm Action",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onCancel,
    onConfirm,
    loading = false,
}) => {

    return (

        <Dialog
            open={open}
            onClose={loading ? undefined : onCancel}
            maxWidth="xs"
            fullWidth

            PaperProps={{
                sx: {
                    borderRadius: 3,

                    border: "1px solid",

                    borderColor: "divider",

                    overflow: "hidden",

                    boxShadow: (theme) => theme.shadows[8],
                }
            }}
        >


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <DialogTitle
                sx={{
                    px: 3,
                    pt: 2.5,
                    pb: 1.5,

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "space-between",

                    gap: 2,
                }}
            >

                <Box>

                    <Typography
                        component="div"
                        sx={{
                            fontSize: 18,

                            fontWeight: 700,

                            color: "text.primary",

                            letterSpacing: "-0.02em",

                            lineHeight: 1.3,
                        }}
                    >
                        {title}
                    </Typography>

                </Box>


                <IconButton
                    onClick={onCancel}
                    disabled={loading}
                    size="small"

                    sx={{
                        width: 32,
                        height: 32,

                        borderRadius: 1.5,

                        color: "text.secondary",

                        "&:hover": {

                            color: "text.primary",

                            backgroundColor: "action.hover",

                        },
                    }}
                >
                    <CloseIcon
                        sx={{
                            fontSize: 18,
                        }}
                    />
                </IconButton>

            </DialogTitle>


            {/* ================================================= */}
            {/* CONTENT */}
            {/* ================================================= */}

            <DialogContent
                sx={{
                    px: 3,
                    pt: 0.5,
                    pb: 1,
                }}
            >

                <Typography
                    variant="body2"

                    sx={{
                        color: "text.secondary",

                        fontSize: 13.5,

                        lineHeight: 1.65,
                    }}
                >
                    {message}
                </Typography>

            </DialogContent>


            {/* ================================================= */}
            {/* ACTIONS */}
            {/* ================================================= */}

            <DialogActions
                sx={{
                    px: 3,
                    pt: 2.5,
                    pb: 2.5,

                    gap: 1.25,

                    borderTop: "1px solid",

                    borderColor: "divider",
                }}
            >


                {/* CANCEL */}

                <Button
                    variant="outlined"

                    onClick={onCancel}

                    disabled={loading}

                    sx={{
                        minWidth: 90,

                        height: 40,

                        borderRadius: 2,

                        textTransform: "none",

                        fontSize: 13,

                        fontWeight: 600,

                        borderColor: "divider",

                        color: "text.secondary",

                        "&:hover": {

                            borderColor: "primary.main",

                            color: "primary.main",

                            backgroundColor: "action.hover",

                        },
                    }}
                >
                    {cancelText}
                </Button>


                {/* CONFIRM */}

                <Button
                    variant="contained"

                    color="error"

                    onClick={onConfirm}

                    disabled={loading}

                    sx={{
                        minWidth: 100,

                        height: 40,

                        borderRadius: 2,

                        textTransform: "none",

                        fontSize: 13,

                        fontWeight: 650,

                        boxShadow: "none",

                        "&:hover": {

                            boxShadow: "none",

                        },
                    }}
                >
                    {loading
                        ? "Please wait..."
                        : confirmText
                    }
                </Button>

            </DialogActions>

        </Dialog>

    );

};


export default ConfirmationDialog;