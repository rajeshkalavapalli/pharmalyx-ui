import { useEffect, useState } from "react";

import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ImageNotSupportedRounded, ReportProblemRounded } from "@mui/icons-material";

import Tag from "../../../components/Tag/Tag";
import { DUPLICATE_REASON, describeReason, fetchPhotoUrl } from "../index";

// Signboard photo fetched with the sign-in header.
export function EvidencePhoto({ evidenceId, alt, height }) {
    const [url, setUrl] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!evidenceId) return undefined;
        let active = true;
        let objectUrl = null;

        fetchPhotoUrl(evidenceId)
            .then((value) => {
                objectUrl = value;
                if (active) setUrl(value);
            })
            .catch(() => active && setFailed(true));

        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [evidenceId]);

    return (
        <Box
            sx={(theme) => ({
                height: height ?? theme.doctorRequests.photoHeight,
                borderRadius: theme.calendar.cell.radius,
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
                backgroundColor: theme.palette.surface.muted,
                color: theme.palette.text.disabled,
            })}
        >
            {url ? (
                <Box component="img" src={url} alt={alt} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
                <Stack sx={{ alignItems: "center", gap: 0.5 }}>
                    <ImageNotSupportedRounded />
                    <Typography variant="caption">{!evidenceId ? "No photo" : failed ? "Photo unavailable" : "Loading…"}</Typography>
                </Stack>
            )}
        </Box>
    );
}

// Short doctor summary used on both sides of a comparison.
export function DoctorSummary({ title, doctor, photoId, highlight }) {
    return (
        <Box
            sx={(theme) => ({
                p: 1.5,
                minWidth: 0,
                borderRadius: theme.calendar.cell.radius,
                border: "1px solid",
                borderColor: highlight ? alpha(theme.palette.warning.main, theme.tint.strong) : theme.palette.border.subtle,
                backgroundColor: highlight ? alpha(theme.palette.warning.main, theme.tint.hover) : "transparent",
            })}
        >
            <Typography variant="overline" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                {title}
            </Typography>
            <Typography variant="subtitle1">Dr. {String(doctor.DoctorName || "").replace(/^dr\.?\s*/i, "")}</Typography>
            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                {[doctor.Speciality, doctor.HospitalName].filter(Boolean).join(" · ") || "—"}
            </Typography>
            <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                {[doctor.AreaName, doctor.TerritoryName].filter(Boolean).join(", ") || "Area not set"}
                {doctor.CreatedByName ? ` · added by ${doctor.CreatedByName}` : ""}
            </Typography>
            <Stack direction="row" sx={{ gap: 0.5, flexWrap: "wrap", my: 1 }}>
                {doctor.VerificationStatus && <Tag label={doctor.VerificationStatus === "VERIFIED" ? "Verified" : "Provisional"} color={doctor.VerificationStatus === "VERIFIED" ? "success" : "warning"} />}
                {doctor.ApprovalStatus === "PENDING" && <Tag label="Awaiting approval" color="info" />}
                {doctor.HasPhone && <Tag label="Has phone" color="secondary" />}
                {doctor.HasRegistration && <Tag label="Has reg. no." color="secondary" />}
            </Stack>
            {photoId !== undefined && <EvidencePhoto evidenceId={photoId} alt={`Signboard of ${doctor.DoctorName}`} />}
        </Box>
    );
}

// List of possible duplicates: each match with its reasons, optionally side by side with the subject.
function DuplicateMatches({ matches, subject, subjectPhotoId, subjectTitle = "This request" }) {
    if (!matches.length) return null;

    return (
        <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <ReportProblemRounded sx={(theme) => ({ color: theme.palette.warning.main })} />
                <Typography variant="subtitle2">
                    {matches.length} possible duplicate{matches.length === 1 ? "" : "s"}
                </Typography>
            </Stack>

            {matches.map((match) => (
                <Box key={match.doctor.DoctorId}>
                    <Stack direction="row" sx={{ gap: 0.5, flexWrap: "wrap", mb: 1 }}>
                        {match.reasons.map((reason) => (
                            <Tag key={reason.reason} label={describeReason(reason)} color={DUPLICATE_REASON[reason.reason]?.color || "warning"} />
                        ))}
                    </Stack>
                    {subject ? (
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
                            <DoctorSummary title={subjectTitle} doctor={subject} photoId={subjectPhotoId} />
                            <DoctorSummary title="Existing doctor" doctor={match.doctor} photoId={match.doctor.SignboardId || null} highlight />
                        </Box>
                    ) : (
                        <DoctorSummary title="Existing doctor" doctor={match.doctor} highlight />
                    )}
                </Box>
            ))}
        </Stack>
    );
}

export default DuplicateMatches;
