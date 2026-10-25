import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    ArrowForwardRounded,
    CheckCircleRounded,
    LockOutlined,
    RadioButtonUncheckedRounded,
    VisibilityOffRounded,
    VisibilityRounded,
} from "@mui/icons-material";

import BrandMark from "../../components/BrandMark/BrandMark";
import api from "../../configurations/api-config";
import { clearSession, isSignedIn, mustChangePassword, saveSession } from "../../configurations/session";
import { BrandPanel } from "./Login";

// Same rules as the server (utils/passwords.js).
const RULES = [
    { label: "At least 8 characters", test: (value) => value.length >= 8 },
    { label: "A letter", test: (value) => /[A-Za-z]/.test(value) },
    { label: "A digit", test: (value) => /\d/.test(value) },
];

const fieldSx = (theme) => ({
    "& .MuiOutlinedInput-root": { minHeight: theme.login.fieldHeight },
});

function Rule({ met, label }) {
    const Icon = met ? CheckCircleRounded : RadioButtonUncheckedRounded;
    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Icon fontSize="small" sx={(theme) => ({ color: met ? theme.palette.success.main : theme.palette.text.disabled })} />
            <Typography variant="caption" sx={(theme) => ({ color: met ? theme.palette.text.primary : theme.palette.text.secondary })}>
                {label}
            </Typography>
        </Stack>
    );
}

// Choose your own password. Required at the first sign-in after someone else set it (a new
// user, a company owner, a reset); otherwise opened from the top bar.
function ChangePassword() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [forced] = useState(mustChangePassword);

    const [form, setForm] = useState({ current: "", next: "", confirm: "" });
    const [show, setShow] = useState(false);
    const [touched, setTouched] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!isSignedIn()) return <Navigate to="/" replace />;

    const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

    const rulesMet = RULES.every((rule) => rule.test(form.next));
    const matches = form.next.length > 0 && form.next === form.confirm;
    const problems = {
        current: !form.current ? (forced ? "Enter the password you were given." : "Enter your current password.") : "",
        next: !rulesMet ? "Follow the rules below." : form.next === form.current ? "Choose a password different from the current one." : "",
        confirm: !matches ? "The two passwords don't match." : "",
    };
    const shown = (key) => (touched && problems[key]) || "";

    const handleSubmit = async (event) => {
        event.preventDefault();
        setTouched(true);
        if (Object.values(problems).some(Boolean)) return;

        setSubmitting(true);
        setError("");
        try {
            const { data } = await api.post("/app/change-password", { currentPassword: form.current, newPassword: form.next });
            saveSession({ token: data.token, expiresAt: data.expiresAt, mustChangePassword: false });
            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || (err.response ? "Couldn't change your password. Please try again." : "Can't reach the server. Check your connection."));
            setSubmitting(false);
        }
    };

    const handleSignOut = () => {
        clearSession();
        navigate("/", { replace: true });
    };

    const visibility = (
        <InputAdornment position="end">
            <IconButton edge="end" aria-label={show ? "Hide passwords" : "Show passwords"} onClick={() => setShow((value) => !value)}>
                {show ? <VisibilityOffRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}
            </IconButton>
        </InputAdornment>
    );
    const lock = (
        <InputAdornment position="start">
            <LockOutlined fontSize="small" />
        </InputAdornment>
    );

    return (
        <Box
            sx={(theme) => ({
                minHeight: "100dvh",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.1fr) minmax(0, 1fr)" },
                backgroundColor: theme.palette.background.default,
            })}
        >
            <BrandPanel />

            <Box sx={(theme) => ({ display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2.5, sm: 4 }, py: 6, backgroundColor: theme.palette.loginPanel.formBackground, backgroundImage: theme.palette.loginPanel.formImage })}>
                <Box component="form" noValidate onSubmit={handleSubmit} sx={(theme) => ({ width: "100%", maxWidth: theme.login.formMaxWidth })}>
                    {/* Brand on phones, where the panel is hidden */}
                    <Box
                        sx={(theme) => ({
                            display: { xs: "inline-flex", md: "none" },
                            mb: 4,
                            p: 1.25,
                            pr: 2,
                            borderRadius: theme.panel.radius,
                            backgroundColor: theme.palette.loginPanel.background,
                        })}
                    >
                        <BrandMark size={theme.sidebarLayout.markSize} showWordmark tone="light" />
                    </Box>

                    <Typography variant="h2" component="h1">
                        {forced ? "Set your own password" : "Change password"}
                    </Typography>
                    <Typography variant="body2" sx={(theme) => ({ mt: 1, mb: 4, color: theme.palette.text.secondary })}>
                        {forced
                            ? "Your password was set by someone else. Choose one only you know; you'll use it from now on."
                            : "Choose a new password for your Pharmalyx account."}
                    </Typography>

                    <Stack spacing={2.25}>
                        {error && (
                            <Alert severity="error" variant="outlined">
                                {error}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            autoFocus
                            label={forced ? "Password you were given" : "Current password"}
                            type={show ? "text" : "password"}
                            autoComplete="current-password"
                            value={form.current}
                            onChange={set("current")}
                            error={Boolean(shown("current"))}
                            helperText={shown("current") || undefined}
                            sx={fieldSx}
                            slotProps={{ input: { startAdornment: lock, endAdornment: visibility } }}
                        />

                        <TextField
                            fullWidth
                            label="New password"
                            type={show ? "text" : "password"}
                            autoComplete="new-password"
                            value={form.next}
                            onChange={set("next")}
                            error={Boolean(shown("next"))}
                            helperText={shown("next") || undefined}
                            sx={fieldSx}
                            slotProps={{ input: { startAdornment: lock } }}
                        />

                        <Stack spacing={0.5} sx={{ pl: 0.5 }}>
                            {RULES.map((rule) => (
                                <Rule key={rule.label} label={rule.label} met={rule.test(form.next)} />
                            ))}
                        </Stack>

                        <TextField
                            fullWidth
                            label="Confirm new password"
                            type={show ? "text" : "password"}
                            autoComplete="new-password"
                            value={form.confirm}
                            onChange={set("confirm")}
                            error={Boolean(shown("confirm"))}
                            helperText={shown("confirm") || undefined}
                            sx={fieldSx}
                            slotProps={{ input: { startAdornment: lock } }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={submitting}
                            endIcon={submitting ? <CircularProgress size={theme.login.spinnerSize} color="inherit" /> : <ArrowForwardRounded />}
                            sx={(theme) => ({ minHeight: theme.login.fieldHeight, boxShadow: theme.palette.brand.glow })}
                        >
                            {submitting ? "Saving…" : forced ? "Save and continue" : "Save new password"}
                        </Button>

                        {forced ? (
                            <Button onClick={handleSignOut} disabled={submitting}>
                                Sign out
                            </Button>
                        ) : (
                            <Button onClick={() => navigate(-1)} disabled={submitting}>
                                Cancel
                            </Button>
                        )}
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}

export default ChangePassword;
