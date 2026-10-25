import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Alert, Box, Button, Divider, GlobalStyles, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { ArrowBackRounded, PrintRounded, VerifiedRounded } from "@mui/icons-material";

import LoadError from "../../../components/LoadError/LoadError";
import Panel from "../../../components/Panel/Panel";
import { errorMessage, formatAmount, getDayReport, verifyDayReport } from "../index";

const when = (value) => (value ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");
const clock = (value) => (value ? new Date(value).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—");
const dayLabel = (key) => new Date(`${key}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
const stay = (seconds) => (seconds == null ? "—" : seconds < 60 ? `${seconds} s` : `${Math.round(seconds / 60)} min`);
const DECISION = { APPROVED: "Approved", REJECTED: "Rejected", GRANT_DA: "Approved, with DA granted" };
const STATUS = { HELD: "Waiting for the employee's reason", WITH_MANAGER: "With the manager", WITH_ADMIN: "With head office", PAYABLE: "Payable", NOT_PAYABLE: "Not payable" };

// A simple sketch of the day's route (location trail) with the places visits were reported.
function RouteSketch({ route, visits }) {
    const points = [...route, ...visits.map((v) => v.reportedAt).filter(Boolean)];
    if (points.length < 2) return <Typography variant="body2">Not enough location points for a route sketch.</Typography>;
    const lats = points.map((p) => p[0]);
    const lngs = points.map((p) => p[1]);
    const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
    const span = Math.max(maxLat - minLat, maxLng - minLng, 0.002);
    const xy = ([lat, lng]) => [10 + ((lng - minLng) / span) * 380, 190 - ((lat - minLat) / span) * 180];

    return (
        <Box component="svg" viewBox="0 0 400 200" sx={(theme) => ({ width: "100%", maxWidth: 520, border: "1px solid", borderColor: theme.palette.border.default, borderRadius: theme.panel.radius, background: theme.palette.surface.subtle })}>
            <polyline
                fill="none"
                strokeWidth="2"
                points={route.map((p) => xy(p).join(",")).join(" ")}
                style={{ stroke: "currentColor" }}
            />
            {visits
                .filter((v) => v.reportedAt)
                .map((v, i) => {
                    const [x, y] = xy(v.reportedAt);
                    return <circle key={i} cx={x} cy={y} r="5" style={{ fill: "#DC2626", opacity: 0.8 }} />;
                })}
        </Box>
    );
}

// Head office: one printable page about a held or refused day, for disputes. Facts only.
function DayReport() {
    const { reviewId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [error, setError] = useState("");
    const [code, setCode] = useState("");
    const [check, setCheck] = useState(null);

    useEffect(() => {
        getDayReport(reviewId)
            .then(setReport)
            .catch((err) => setError(errorMessage(err, "Couldn't generate the day report")));
    }, [reviewId]);

    const verify = async () => {
        try {
            setCheck(await verifyDayReport(reviewId, code));
        } catch (err) {
            setCheck({ genuine: false, message: errorMessage(err, "Couldn't verify") });
        }
    };

    if (error) return <LoadError title="Couldn't generate the day report" message={error} />;
    if (!report) return null;

    const r = report;
    const policyOk = r.policy.acceptedVersion;

    return (
        <Box>
            {/* Print only the report itself. */}
            <GlobalStyles styles={{ "@media print": { "body *": { visibility: "hidden" }, "#day-report, #day-report *": { visibility: "visible" }, "#day-report": { position: "absolute", left: 0, top: 0, width: "100%" } } }} />

            <Stack direction="row" sx={{ gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Button startIcon={<ArrowBackRounded />} onClick={() => navigate(-1)}>
                    Back
                </Button>
                <Button variant="contained" startIcon={<PrintRounded />} onClick={() => window.print()}>
                    Print / save as PDF
                </Button>
            </Stack>

            <Panel>
                <Box id="day-report" sx={{ display: "grid", gap: 2.5 }}>
                    <Box>
                        <Typography variant="overline">Pharmalyx · Day report · Ref. {r.reference}</Typography>
                        <Typography variant="h3" component="h1">
                            {r.employee.name}
                            {r.employee.designation ? ` (${r.employee.designation})` : ""}
                        </Typography>
                        <Typography variant="body1">{dayLabel(r.date)}</Typography>
                        <Typography variant="body2">Status: {STATUS[r.status] || r.status}</Typography>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="h6">1. What was claimed</Typography>
                        <Typography variant="body2">
                            DA {formatAmount(r.claimed.da)} + TA {formatAmount(r.claimed.ta)} = <b>{formatAmount(r.claimed.total)}</b>, for {r.visits.length} reported visit(s).
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6">2. What the phone recorded</Typography>
                        <Typography variant="body2">
                            Location trail in work hours: {r.travel.points} location record(s), about <b>{r.travel.km} km</b> travelled
                            {r.travel.first ? `, from ${clock(r.travel.first)} to ${clock(r.travel.last)}` : ""}.
                        </Typography>
                        {r.findings.map((finding) => (
                            <Typography key={finding.code} variant="body2">
                                • {finding.text}
                            </Typography>
                        ))}
                        <Box sx={{ mt: 1.5, color: "primary.main" }}>
                            <RouteSketch route={r.travel.route} visits={r.visits} />
                            <Typography variant="caption" component="p" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                Line: location trail. Red dots: where visits were reported.
                            </Typography>
                        </Box>
                        <Table size="small" sx={{ mt: 1.5 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Doctor</TableCell>
                                    <TableCell>Area</TableCell>
                                    <TableCell>Checked in</TableCell>
                                    <TableCell>Saved</TableCell>
                                    <TableCell>Stay</TableCell>
                                    <TableCell>Reported at (GPS)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {r.visits.map((v, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{v.doctor}</TableCell>
                                        <TableCell>{v.area || "—"}</TableCell>
                                        <TableCell>{clock(v.checkIn)}</TableCell>
                                        <TableCell>{clock(v.checkOut)}</TableCell>
                                        <TableCell>{stay(v.staySeconds)}</TableCell>
                                        <TableCell>{v.reportedAt ? `${v.reportedAt[0].toFixed(5)}, ${v.reportedAt[1].toFixed(5)}` : "—"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>

                    <Box>
                        <Typography variant="h6">3. The company rule</Typography>
                        {r.policy.points.map((point) => (
                            <Typography key={point} variant="body2">
                                • {point}
                            </Typography>
                        ))}
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {policyOk
                                ? `Accepted by the employee in the app: version ${r.policy.acceptedVersion}, on ${when(r.policy.acceptedAt)}.`
                                : "The employee has not accepted this policy in the app yet."}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6">4. What happened next</Typography>
                        <Typography variant="body2">
                            Employee's reason: {r.steps.employee ? `"${r.steps.employee.reason}" (${when(r.steps.employee.at)})` : "none given"}
                        </Typography>
                        <Typography variant="body2">
                            Manager: {r.steps.manager ? `${r.steps.manager.name}, ${DECISION[r.steps.manager.decision]}: "${r.steps.manager.comment}" (${when(r.steps.manager.at)})` : "no decision"}
                        </Typography>
                        <Typography variant="body2">
                            Head office: {r.steps.admin ? `${r.steps.admin.name}, ${DECISION[r.steps.admin.decision]}${r.steps.admin.comment ? `: "${r.steps.admin.comment}"` : ""} (${when(r.steps.admin.at)})` : "no decision"}
                        </Typography>
                        {r.steps.autoNote && <Typography variant="body2">Note: {r.steps.autoNote}</Typography>}
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="h6">5. Record check</Typography>
                        <Typography variant="body2">
                            Generated from Pharmalyx on {when(r.generatedAt)}. Verification code: <b>{r.verificationCode}</b>
                        </Typography>
                        <Typography variant="caption">The code changes if any part of this record changes. Location records and decisions are kept and are not edited.</Typography>
                    </Box>
                </Box>
            </Panel>

            <Panel title="Verify a printed copy" subtitle="Type the code printed on a copy of this report to check it matches the record.">
                <Stack direction="row" sx={{ gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                    <TextField size="small" label="Verification code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 9))} />
                    <Button startIcon={<VerifiedRounded />} onClick={verify} disabled={code.length < 9}>
                        Verify
                    </Button>
                </Stack>
                {check && (
                    <Alert severity={check.genuine ? "success" : "error"} variant="outlined" sx={{ mt: 1.5 }}>
                        {check.message}
                    </Alert>
                )}
            </Panel>
        </Box>
    );
}

export default DayReport;
