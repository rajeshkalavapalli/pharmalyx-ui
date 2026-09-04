import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
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

            {/* ================================================= */}
            {/* TITLE */}
            {/* ================================================= */}

            <DialogTitle
                sx={{
                    px: 3,
                    pt: 3,
                    pb: 1,

                    fontSize: "17px",
                    fontWeight: 650,

                    color: "text.primary",

                    letterSpacing: "-0.01em"
                }}
            >
                {title}
            </DialogTitle>


            {/* ================================================= */}
            {/* MESSAGE */}
            {/* ================================================= */}

            <DialogContent
                sx={{
                    px: 3,
                    pt: 0.5,
                    pb: 1
                }}
            >

                <Typography
                    variant="body2"
                    sx={{
                        color: "text.secondary",
                        lineHeight: 1.6
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
                    pb: 2.5,
                    pt: 2,

                    gap: 1
                }}
            >

                {/* Cancel */}

                <Button
                    variant="outlined"
                    onClick={onCancel}
                >
                    Cancel
                </Button>


                {/* Confirm */}

                <Button
                    variant="contained"
                    color="error"
                    onClick={onConfirm}
                >
                    Close
                </Button>

            </DialogActions>

        </Dialog>
    );
};


export default ConfirmationDialog;