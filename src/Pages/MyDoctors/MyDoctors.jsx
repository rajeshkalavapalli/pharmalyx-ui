import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Divider,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    CakeRounded,
    EventRepeatRounded,
    GroupsRounded,
    RefreshRounded,
    SearchRounded,
    StarRounded,
} from "@mui/icons-material";

import ActingUserSelect from "../../components/ActingUserSelect/ActingUserSelect";
import useActingUser from "../../components/ActingUserSelect/useActingUser";
import PageHeader from "../../components/PageHeader/PageHeader";
import Panel from "../../components/Panel/Panel";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import StatCard from "../../components/StatCard/StatCard";

import DoctorCard from "./components/DoctorCard";
import DoctorProfileDrawer from "./components/DoctorProfileDrawer";
import UpcomingOccasions from "./components/UpcomingOccasions";
import {
    DOCTOR_CATEGORY,
    OCCASION_SOON_DAYS,
    getMyDoctors,
    getMyTeam,
    upcomingOccasions,
} from "./index";

const errorMessage = (error, fallback) => {
    const data = error.response?.data;
    const message = data?.message || error.message || fallback;

    return data?.error && data.error !== message ? `${message} (${data.error})` : message;
};

const uniqueSorted = (values) =>
    [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))].sort();

const compactSelectSx = (theme) => ({
    minWidth: theme.search.minWidth,
    "& .MuiOutlinedInput-root": { minHeight: theme.field.compactHeight },
    "& .MuiSelect-select": { py: 0 },
});

function EmptyState({ title, message }) {
    return (
        <Box sx={(theme) => ({ py: theme.table.emptyPaddingY, textAlign: "center" })}>
            <GroupsRounded
                sx={(theme) => ({
                    fontSize: theme.table.emptyIconSize,
                    color: theme.palette.text.disabled,
                })}
            />
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
                {title}
            </Typography>
            <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                {message}
            </Typography>
        </Box>
    );
}

function MyDoctors() {
    const { actingUserId, setActingUserId, users } = useActingUser();

    const [team, setTeam] = useState([]);
    const [viewUserId, setViewUserId] = useState("");

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("ALL");
    const [territory, setTerritory] = useState("");
    const [speciality, setSpeciality] = useState("");

    const [selected, setSelected] = useState(null);

    // =========================================================
    // TEAM (who the manager can view)
    // =========================================================

    useEffect(() => {
        setViewUserId(actingUserId);
        setTeam([]);

        if (!actingUserId) return;

        getMyTeam()
            .then((response) => setTeam(response?.team || []))
            .catch(() => setTeam([]));
    }, [actingUserId]);

    // =========================================================
    // DOCTORS
    // =========================================================

    const requestRef = useRef(0);

    const loadDoctors = useCallback(async () => {
        if (!viewUserId) return;

        const requestId = ++requestRef.current;
        const isCurrent = () => requestId === requestRef.current;

        setLoading(true);
        setLoadError("");

        try {
            const response = await getMyDoctors(viewUserId);

            if (isCurrent()) setDoctors(response?.doctors || []);
        } catch (error) {
            if (!isCurrent()) return;

            setDoctors([]);
            setLoadError(errorMessage(error, "Failed to load doctors"));
        } finally {
            if (isCurrent()) setLoading(false);
        }
    }, [viewUserId]);

    useEffect(() => {
        setSearch("");
        setCategory("ALL");
        setTerritory("");
        setSpeciality("");
        loadDoctors();
    }, [loadDoctors]);

    // =========================================================
    // DERIVED
    // =========================================================

    const territories = useMemo(() => uniqueSorted(doctors.map((d) => d.TerritoryName)), [doctors]);
    const specialities = useMemo(() => uniqueSorted(doctors.map((d) => d.Speciality)), [doctors]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return doctors.filter((doctor) => {
            if (category === "NONE" ? doctor.Category : category !== "ALL" && doctor.Category !== category) {
                return false;
            }

            if (territory && doctor.TerritoryName !== territory) return false;
            if (speciality && String(doctor.Speciality || "").trim() !== speciality) return false;

            if (!term) return true;

            return [doctor.DoctorName, doctor.HospitalName, doctor.Speciality, doctor.AreaName]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(term));
        });
    }, [doctors, search, category, territory, speciality]);

    const occasions = useMemo(() => upcomingOccasions(doctors), [doctors]);

    const stats = useMemo(
        () => ({
            total: doctors.length,
            classA: doctors.filter((d) => d.Category === "A").length,
            monthlyVisits: doctors.reduce((sum, d) => sum + (Number(d.VisitsPerMonth) || 0), 0),
            withoutTarget: doctors.filter((d) => d.VisitsPerMonth == null).length,
            soon: occasions.filter((o) => o.days <= OCCASION_SOON_DAYS).length,
        }),
        [doctors, occasions]
    );

    const categoryCount = (key) => doctors.filter((d) => d.Category === key).length;

    const categoryOptions = [
        { value: "ALL", label: `All · ${doctors.length}` },
        ...Object.keys(DOCTOR_CATEGORY).map((key) => ({
            value: key,
            label: `${key} · ${categoryCount(key)}`,
        })),
        ...(doctors.some((d) => !d.Category)
            ? [{ value: "NONE", label: `Unrated · ${doctors.filter((d) => !d.Category).length}` }]
            : []),
    ];

    const hasFilters = search || category !== "ALL" || territory || speciality;

    const viewing = team.find((member) => member.UserId === viewUserId);
    const viewingOther = viewing && !viewing.IsSelf;

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <Box>
            <PageHeader
                eyebrow="Field operations · Doctors"
                title={viewingOther ? `${viewing.Name}'s doctors` : "My doctors"}
                subtitle="The doctors you call on, with their priority, visit targets and upcoming occasions."
                actions={
                    <>
                        <ActingUserSelect users={users} value={actingUserId} onChange={setActingUserId} />
                    </>
                }
            />

            {!actingUserId ? (
                <Panel>
                    <EmptyState
                        title="Choose a user to continue"
                        message="Sign-in is not connected yet. Pick who you are acting as from the header."
                    />
                </Panel>
            ) : (
                <>
                    {/* SUMMARY */}

                    <Box
                        sx={(theme) => ({
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "repeat(2, minmax(0, 1fr))",
                                lg: "repeat(4, minmax(0, 1fr))",
                            },
                            gap: theme.stat.gap,
                            mb: theme.pageHeader.marginBottom,
                        })}
                    >
                        <StatCard
                            icon={GroupsRounded}
                            label="Doctors"
                            value={stats.total}
                            caption="Assigned to call on"
                            color="primary"
                        />
                        <StatCard
                            icon={StarRounded}
                            label="Class A"
                            value={stats.classA}
                            caption="High-potential doctors"
                            color="warning"
                        />
                        <StatCard
                            icon={EventRepeatRounded}
                            label="Monthly visit target"
                            value={stats.monthlyVisits}
                            caption={
                                stats.withoutTarget
                                    ? `${stats.withoutTarget} doctor(s) without a target`
                                    : "Calls planned per month"
                            }
                            color="success"
                        />
                        <StatCard
                            icon={CakeRounded}
                            label="Occasions this week"
                            value={stats.soon}
                            caption="Birthdays & anniversaries"
                            color="error"
                        />
                    </Box>

                    <UpcomingOccasions occasions={occasions} onOpen={setSelected} />

                    {/* DIRECTORY */}

                    <Panel disablePadding>
                        <Stack
                            direction={{ xs: "column", lg: "row" }}
                            sx={(theme) => ({
                                alignItems: { xs: "stretch", lg: "center" },
                                gap: theme.panel.gap,
                                p: theme.panel.padding,
                            })}
                        >
                            <TextField
                                size="small"
                                placeholder="Search name, hospital, speciality…"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                sx={(theme) => ({
                                    flex: 1,
                                    minWidth: theme.search.minWidth,
                                    "& .MuiOutlinedInput-root": { minHeight: theme.field.compactHeight },
                                })}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchRounded fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <TextField
                                select
                                size="small"
                                label="Territory"
                                value={territory}
                                onChange={(event) => setTerritory(event.target.value)}
                                sx={compactSelectSx}
                            >
                                <MenuItem value="">All territories</MenuItem>
                                {territories.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        {name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                size="small"
                                label="Speciality"
                                value={speciality}
                                onChange={(event) => setSpeciality(event.target.value)}
                                sx={compactSelectSx}
                            >
                                <MenuItem value="">All specialities</MenuItem>
                                {specialities.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        {name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>

                        <Divider />

                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            sx={(theme) => ({
                                alignItems: { xs: "flex-start", md: "center" },
                                justifyContent: "space-between",
                                gap: theme.panel.gap,
                                px: theme.panel.padding,
                                py: theme.panel.headerPaddingY,
                            })}
                        >
                            <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
                                <SegmentedControl
                                    value={category}
                                    options={categoryOptions}
                                    onChange={setCategory}
                                />
                            </Box>

                            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                <Typography
                                    variant="caption"
                                    sx={(theme) => ({ color: theme.palette.text.secondary })}
                                >
                                    Showing {filtered.length} of {doctors.length}
                                </Typography>

                                {hasFilters && (
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setSearch("");
                                            setCategory("ALL");
                                            setTerritory("");
                                            setSpeciality("");
                                        }}
                                    >
                                        Clear filters
                                    </Button>
                                )}
                            </Stack>
                        </Stack>

                        <Box
                            sx={(theme) => ({
                                px: theme.panel.padding,
                                pb: theme.panel.padding,
                                opacity: loading ? theme.table.loadingOpacity : 1,
                                transition: theme.calendar.transition,
                            })}
                        >
                            {loadError ? (
                                <Alert
                                    severity="error"
                                    variant="outlined"
                                    action={
                                        <Button
                                            color="error"
                                            size="small"
                                            startIcon={<RefreshRounded />}
                                            onClick={loadDoctors}
                                        >
                                            Retry
                                        </Button>
                                    }
                                >
                                    <AlertTitle>Couldn't load doctors</AlertTitle>
                                    {loadError}
                                </Alert>
                            ) : doctors.length === 0 ? (
                                <EmptyState
                                    title={loading ? "Loading doctors…" : "No doctors assigned yet"}
                                    message={
                                        loading
                                            ? ""
                                            : "Ask your admin to map doctors in Configuration → User Doctor Mapping."
                                    }
                                />
                            ) : filtered.length === 0 ? (
                                <EmptyState
                                    title="No doctors match"
                                    message="Try a different search or clear the filters."
                                />
                            ) : (
                                <Box
                                    sx={(theme) => ({
                                        display: "grid",
                                        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${theme.entityCard.minWidth}px), 1fr))`,
                                        gap: theme.stat.gap,
                                    })}
                                >
                                    {filtered.map((doctor) => (
                                        <DoctorCard
                                            key={doctor.DoctorId}
                                            doctor={doctor}
                                            onOpen={() => setSelected(doctor)}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Panel>
                </>
            )}

            <DoctorProfileDrawer
                doctor={selected}
                userId={viewUserId}
                canRequest={!viewingOther}
                onClose={() => setSelected(null)}
            />
        </Box>
    );
}

export default MyDoctors;
