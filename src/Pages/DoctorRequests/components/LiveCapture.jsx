import { useEffect, useRef, useState } from "react";

import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { CameraAltRounded, GpsFixedRounded, MyLocationRounded, RefreshRounded } from "@mui/icons-material";

export function LocationStatus({ location, label = "Clinic location" }) {
    const { status, fix, start } = location;
    const ok = status === "CAPTURED";

    return (
        <Stack
            direction="row"
            spacing={1.5}
            sx={(theme) => ({
                p: 1.5,
                alignItems: "center",
                borderRadius: theme.calendar.cell.radius,
                border: "1px solid",
                borderColor: ok ? alpha(theme.palette.success.main, theme.tint.border) : theme.palette.border.default,
                backgroundColor: ok ? alpha(theme.palette.success.main, theme.tint.hover) : "transparent",
            })}
        >
            <GpsFixedRounded sx={(theme) => ({ color: ok ? theme.palette.success.main : theme.palette.text.secondary })} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2">{label}</Typography>
                <Typography variant="caption" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                    {status === "IDLE" && "Capture it while you are at the clinic."}
                    {status === "SEARCHING" && `Getting an accurate fix…${fix ? ` ±${Math.round(fix.accuracy)} m so far` : ""}`}
                    {ok && `${fix.latitude.toFixed(5)}, ${fix.longitude.toFixed(5)} · ±${Math.round(fix.accuracy)} m`}
                    {status === "DENIED" && "Location is blocked. Allow location for this site in your browser settings."}
                    {status === "UNAVAILABLE" && "Location is not available. Move outdoors and try again."}
                </Typography>
                {status === "SEARCHING" && <LinearProgress sx={{ mt: 0.75 }} />}
            </Box>
            <Button size="small" variant={ok ? "text" : "contained"} startIcon={<MyLocationRounded />} onClick={start} disabled={status === "SEARCHING"}>
                {ok ? "Again" : "Capture"}
            </Button>
        </Stack>
    );
}

// =========================================================
// Camera: live capture only (no gallery picker). Resizes to 1280 px JPEG before upload.
// =========================================================

const MAX_SIDE = 1280;

export function CameraCapture({ value, onChange, label = "Clinic signboard photo" }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [mode, setMode] = useState(value ? "PREVIEW" : "IDLE");
    const [error, setError] = useState("");
    const [previewUrl, setPreviewUrl] = useState(null);

    const stopStream = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    };

    useEffect(() => () => stopStream(), []);

    useEffect(() => {
        if (!value) {
            setPreviewUrl(null);
            return undefined;
        }
        const url = URL.createObjectURL(value);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [value]);

    const open = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
            streamRef.current = stream;
            setMode("LIVE");
            requestAnimationFrame(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(() => {});
                }
            });
        } catch {
            setError("Camera is blocked or not available. Allow camera access for this site and try again.");
        }
    };

    const capture = () => {
        const video = videoRef.current;
        if (!video?.videoWidth) return;

        const scale = Math.min(1, MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
            (blob) => {
                stopStream();
                onChange(blob);
                setMode("PREVIEW");
            },
            "image/jpeg",
            0.82
        );
    };

    return (
        <Box sx={(theme) => ({ p: 1.5, borderRadius: theme.calendar.cell.radius, border: "1px solid", borderColor: value ? theme.palette.success.light : theme.palette.border.default })}>
            <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, mb: mode === "IDLE" ? 0 : 1.5 }}>
                <CameraAltRounded sx={(theme) => ({ color: value ? theme.palette.success.main : theme.palette.text.secondary })} />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">{label}</Typography>
                    <Typography variant="caption" sx={(theme) => ({ color: error ? theme.palette.error.main : theme.palette.text.secondary })}>
                        {error || (value ? "Photo taken in the app." : "Take it now with the camera; gallery photos are not accepted.")}
                    </Typography>
                </Box>
                {mode === "IDLE" && (
                    <Button size="small" variant="contained" startIcon={<CameraAltRounded />} onClick={open}>
                        Open camera
                    </Button>
                )}
                {mode === "PREVIEW" && (
                    <Button size="small" startIcon={<RefreshRounded />} onClick={() => { onChange(null); open(); }}>
                        Retake
                    </Button>
                )}
            </Stack>

            {mode === "LIVE" && (
                <Box>
                    <Box component="video" ref={videoRef} playsInline muted sx={(theme) => ({ width: "100%", maxHeight: theme.doctorRequests.cameraMaxHeight, borderRadius: theme.calendar.cell.radius, backgroundColor: theme.palette.secondary.dark, objectFit: "cover" })} />
                    <Stack direction="row" sx={{ gap: 1, mt: 1, justifyContent: "flex-end" }}>
                        <Button size="small" onClick={() => { stopStream(); setMode(value ? "PREVIEW" : "IDLE"); }}>
                            Cancel
                        </Button>
                        <Button size="small" variant="contained" startIcon={<CameraAltRounded />} onClick={capture}>
                            Take photo
                        </Button>
                    </Stack>
                </Box>
            )}

            {mode === "PREVIEW" && previewUrl && (
                <Box component="img" src={previewUrl} alt="Clinic signboard" sx={(theme) => ({ width: "100%", maxHeight: theme.doctorRequests.cameraMaxHeight, objectFit: "cover", borderRadius: theme.calendar.cell.radius })} />
            )}
        </Box>
    );
}
