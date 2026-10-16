import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
import { alpha, useTheme } from "@mui/material/styles";
import {
    ArrowForwardRounded,
    CheckCircleRounded,
    InsightsRounded,
    LockOutlined,
    PersonOutlineRounded,
    PlaceRounded,
    RouteRounded,
    VisibilityOffRounded,
    VisibilityRounded,
} from "@mui/icons-material";

import BrandMark from "../../components/BrandMark/BrandMark";
import api from "../../configurations/api-config";

const FEATURES = [
    { icon: RouteRounded, text: "Tour plans, visits and DCRs in one flow" },
    { icon: PlaceRounded, text: "GPS-verified calls that work offline" },
    { icon: InsightsRounded, text: "Coverage, deviations and team insights" },
];

// Illustrative card on the brand panel (not live data).
function PreviewCard() {
    const rows = [
        { label: "Doctor coverage", value: 82, color: "primary" },
        { label: "Calls as planned", value: 91, color: "success" },
        { label: "DCRs on time", value: 76, color: "warning" },
    ];

    return (
        <Box
            aria-hidden
            sx={(theme) => ({
                width: theme.login.previewWidth,
                maxWidth: "100%",
                p: 2.5,
                borderRadius: theme.panel.radius,
                border: "1px solid",
                borderColor: theme.palette.sidebar.border,
                backgroundColor: alpha(theme.palette.sidebar.surface, 0.72),
                backdropFilter: "blur(16px)",
                boxShadow: theme.elevation.lg,
            })}
        >
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="subtitle2" sx={(theme) => ({ color: theme.palette.sidebar.activeText })}>
                    This month
                </Typography>
                <Box
                    component="span"
                    sx={(theme) => ({
                        ...theme.typography.micro,
                        px: 1,
                        py: 0.25,
                        borderRadius: theme.statusChip.radius,
                        color: theme.palette.success.light,
                        backgroundColor: alpha(theme.palette.success.main, theme.tint.border),
                    })}
                >
                    ▲ 12%
                </Box>
            </Stack>

            <Stack spacing={1.75}>
                {rows.map((row) => (
                    <Box key={row.label}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.75 }}>
                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.sidebar.text })}>
                                {row.label}
                            </Typography>
                            <Typography variant="caption" sx={(theme) => ({ color: theme.palette.sidebar.activeText, fontWeight: 700 })}>
                                {row.value}%
                            </Typography>
                        </Stack>
                        <Box
                            sx={(theme) => ({
                                height: theme.stat.progressHeight,
                                borderRadius: theme.stat.progressHeight,
                                backgroundColor: theme.palette.sidebar.hover,
                                overflow: "hidden",
                            })}
                        >
                            <Box
                                sx={(theme) => ({
                                    width: `${row.value}%`,
                                    height: "100%",
                                    borderRadius: "inherit",
                                    backgroundImage:
                                        row.color === "primary"
                                            ? theme.palette.brand.gradient
                                            : `linear-gradient(90deg, ${theme.palette[row.color].main}, ${theme.palette[row.color].light})`,
                                })}
                            />
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
}

function BrandPanel() {
    const theme = useTheme();

    return (
        <Box
            sx={(theme) => ({
                position: "relative",
                overflow: "hidden",
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                justifyContent: "space-between",
                px: theme.login.brandPaddingX,
                py: theme.login.brandPaddingY,
                backgroundColor: theme.palette.sidebar.background,
                backgroundImage: theme.palette.sidebar.backgroundImage,

                // Glowing gradient orbs.
                "&::before, &::after": {
                    content: '""',
                    position: "absolute",
                    width: theme.login.glowSize,
                    height: theme.login.glowSize,
                    borderRadius: "50%",
                    filter: "blur(90px)",
                    pointerEvents: "none",
                },
                "&::before": {
                    top: -theme.login.glowSize / 3,
                    right: -theme.login.glowSize / 3,
                    backgroundColor: alpha(theme.palette.brand.indigo, 0.45),
                },
                "&::after": {
                    bottom: -theme.login.glowSize / 2.5,
                    left: -theme.login.glowSize / 4,
                    backgroundColor: alpha(theme.palette.brand.violet, 0.35),
                },
            })}
        >
            <Box sx={{ position: "relative", zIndex: 1 }}>
                <BrandMark size={theme.login.brandMarkSize} showWordmark tagline="Field intelligence" />
            </Box>

            <Box sx={(theme) => ({ position: "relative", zIndex: 1, maxWidth: theme.login.headlineMaxWidth })}>
                <Typography
                    variant="h1"
                    component="p"
                    sx={(theme) => ({ color: theme.palette.sidebar.activeText })}
                >
                    Field intelligence for{" "}
                    <Box
                        component="span"
                        sx={(theme) => ({
                            backgroundImage: theme.palette.brand.gradient,
                            filter: "brightness(1.4)",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                        })}
                    >
                        modern pharma teams
                    </Box>
                </Typography>

                <Typography
                    variant="body1"
                    sx={(theme) => ({ mt: 2, color: theme.palette.sidebar.text })}
                >
                    Plan, execute and review every doctor call with clarity — from the
                    representative's phone to the manager's dashboard.
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 4 }}>
                    {FEATURES.map(({ icon: Icon, text }) => (
                        <Stack key={text} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                            <Box
                                sx={(theme) => ({
                                    width: theme.avatar.sizeSmall,
                                    height: theme.avatar.sizeSmall,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: theme.sidebarLayout.radius,
                                    color: theme.palette.sidebar.active,
                                    backgroundColor: theme.palette.sidebar.activeLight,
                                })}
                            >
                                <Icon fontSize="small" />
                            </Box>
                            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.sidebar.text })}>
                                {text}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </Box>

            <Stack
                direction="row"
                sx={{ position: "relative", zIndex: 1, alignItems: "flex-end", justifyContent: "space-between", gap: 3 }}
            >
                <PreviewCard />
                <Typography
                    variant="caption"
                    sx={(theme) => ({ color: theme.palette.sidebar.mutedText, display: { md: "none", lg: "block" } })}
                >
                    © {new Date().getFullYear()} Pharmalyx
                </Typography>
            </Stack>
        </Box>
    );
}

function Login() {
    const theme = useTheme();
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!login.trim() || !password) {
            setError("Enter your username and password.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const response = await api.post("/app/login", { login: login.trim(), password });
            const user = response.data?.user;

            localStorage.setItem("userId", user.UserId);
            window.dispatchEvent(new Event("pharmalyx:acting-user"));
            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    (err.response ? "Sign-in failed. Please try again." : "Can't reach the server. Check your connection.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    const fieldSx = (theme) => ({
        "& .MuiOutlinedInput-root": { minHeight: theme.login.fieldHeight },
    });

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

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: { xs: 2.5, sm: 4 },
                    py: 6,
                }}
            >
                <Box
                    component="form"
                    noValidate
                    onSubmit={handleSubmit}
                    sx={(theme) => ({ width: "100%", maxWidth: theme.login.formMaxWidth })}
                >
                    {/* Brand on phones, where the panel is hidden */}
                    <Box
                        sx={(theme) => ({
                            display: { xs: "inline-flex", md: "none" },
                            mb: 4,
                            p: 1.25,
                            pr: 2,
                            borderRadius: theme.panel.radius,
                            backgroundColor: theme.palette.sidebar.background,
                        })}
                    >
                        <BrandMark size={theme.sidebarLayout.markSize} showWordmark />
                    </Box>

                    <Typography variant="h2" component="h1">
                        Welcome back
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={(theme) => ({ mt: 1, mb: 4, color: theme.palette.text.secondary })}
                    >
                        Sign in to your Pharmalyx workspace.
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
                            label="Username or email"
                            autoComplete="username"
                            value={login}
                            onChange={(event) => setLogin(event.target.value)}
                            sx={fieldSx}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutlineRounded fontSize="small" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            sx={fieldSx}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined fontSize="small" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                edge="end"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                onClick={() => setShowPassword((value) => !value)}
                                            >
                                                {showPassword ? (
                                                    <VisibilityOffRounded fontSize="small" />
                                                ) : (
                                                    <VisibilityRounded fontSize="small" />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={submitting}
                            endIcon={submitting ? <CircularProgress size={theme.login.spinnerSize} color="inherit" /> : <ArrowForwardRounded />}
                            sx={(theme) => ({
                                minHeight: theme.login.fieldHeight,
                                boxShadow: theme.palette.brand.glow,
                            })}
                        >
                            {submitting ? "Signing in…" : "Sign in"}
                        </Button>
                    </Stack>

                    <Stack
                        direction="row"
                        spacing={1}
                        sx={(theme) => ({ mt: 4, alignItems: "center", color: theme.palette.text.secondary })}
                    >
                        <CheckCircleRounded fontSize="small" sx={(theme) => ({ color: theme.palette.success.main })} />
                        <Typography variant="caption">
                            Passwords are encrypted. Forgot yours? Ask your administrator to reset it.
                        </Typography>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}

export default Login;
