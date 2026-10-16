import { Alert, AlertTitle, Button } from "@mui/material";
import { RefreshRounded } from "@mui/icons-material";

// Error card with the server's reason and a Retry button.
function LoadError({ title, message, onRetry }) {
    return (
        <Alert
            severity="error"
            variant="outlined"
            action={
                onRetry && (
                    <Button color="error" size="small" startIcon={<RefreshRounded />} onClick={onRetry}>
                        Retry
                    </Button>
                )
            }
        >
            <AlertTitle>{title}</AlertTitle>
            {message}
        </Alert>
    );
}

export default LoadError;
