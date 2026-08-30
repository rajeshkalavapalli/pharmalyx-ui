import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from "@mui/material";

const ConfirmationDialog = ({
    open,
    title,
    message,
    onCancel,
    onConfirm
}) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle
                sx={{
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "text.primary",
                    px: 2.5,
                    pt: 2.5,
                    pb: 1
                }}
            >
                {title}
            </DialogTitle>

            <DialogContent
                sx={{
                    px: 2.5,
                    py: 1
                }}
            >
                {message}
            </DialogContent>

            <DialogActions
                sx={{
                    px: 2.5,
                    pb: 2,
                    pt: 1.5,
                    gap: 1
                }}
            >
                <Button
                    onClick={onCancel}
                    sx={{
                        textTransform: "none",
                        fontWeight: 500
                    }}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    color="warning"
                    onClick={onConfirm}
                    sx={{
                        textTransform: "none",
                        fontWeight: 600
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;