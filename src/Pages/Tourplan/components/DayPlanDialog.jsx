import { useEffect, useState } from "react";

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    CloseRounded,
    DeleteOutlineRounded,
    EventBusyRounded,
    WorkOutlineRounded,
} from "@mui/icons-material";

import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import { getAreasByTerritory } from "../../Doctors/index";
import { DAY_TYPE, REMARKS_LIMIT, describeDates, formatDayLabel } from "../index";

const DAY_TYPE_OPTIONS = [
    { value: DAY_TYPE.WORKING, label: "Working day", icon: WorkOutlineRounded },
    { value: DAY_TYPE.OFF, label: "Off / Leave", icon: EventBusyRounded },
];

// Mounted fresh (via `key`) for each selection, so initial state comes from props.
function DayPlanDialog({
    open,
    dates,
    initialPlan,
    hasExistingPlan,
    territories,
    readOnly,
    onClose,
    onApply,
    onClear,
}) {
    const [dayType, setDayType] = useState(initialPlan?.dayType || DAY_TYPE.WORKING);
    const [territory, setTerritory] = useState(initialPlan?.territory || "");
    const [area, setArea] = useState(initialPlan?.area || "");
    const [remarks, setRemarks] = useState(initialPlan?.remarks || "");
    const [areas, setAreas] = useState([]);
    const [areasLoading, setAreasLoading] = useState(false);

    useEffect(() => {
        if (!territory) {
            setAreas([]);
            return undefined;
        }

        let active = true;

        setAreasLoading(true);

        getAreasByTerritory(territory)
            .then((response) => {
                if (active) setAreas(Array.isArray(response) ? response : []);
            })
            .catch(() => {
                if (active) setAreas([]);
            })
            .finally(() => {
                if (active) setAreasLoading(false);
            });

        return () => {
            active = false;
        };
    }, [territory]);

    const isWorking = dayType === DAY_TYPE.WORKING;
    const canApply = !isWorking || (territory && area);
    const single = dates.length === 1;

    const handleApply = () => {
        const territoryName =
            territories.find((item) => item.TerritoryId === territory)?.TerritoryName || "";
        const areaName = areas.find((item) => item.AreaId === area)?.AreaName || "";

        onApply({
            dayType,
            territory: isWorking ? territory : "",
            area: isWorking ? area : "",
            territoryName: isWorking ? territoryName : "",
            areaName: isWorking ? areaName : "",
            remarks: remarks.trim(),
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            slotProps={{
                paper: {
                    sx: (theme) => ({
                        maxWidth: theme.dialog.width,
                        backgroundColor: theme.palette.background.paper,
                    }),
                },
            }}
        >
            <DialogTitle
                component="div"
                sx={(theme) => ({
                    px: theme.dialog.paddingX,
                    pt: theme.dialog.paddingY,
                    pb: 1,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                })}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="overline"
                        component="p"
                        sx={(theme) => ({ color: theme.palette.primary.main })}
                    >
                        {readOnly ? "Day plan" : single ? "Plan day" : `Plan ${dates.length} days`}
                    </Typography>

                    <Typography variant="h5" component="h2">
                        {single ? formatDayLabel(dates[0]) : describeDates(dates)}
                    </Typography>
                </Box>

                <IconButton aria-label="Close" onClick={onClose} size="small">
                    <CloseRounded />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={(theme) => ({
                    px: theme.dialog.paddingX,
                    pt: `${theme.spacing(1)} !important`,
                })}
            >
                <Stack spacing={2.5}>
                    {!single && !readOnly && (
                        <Typography
                            variant="body2"
                            sx={(theme) => ({ color: theme.palette.text.secondary })}
                        >
                            The same plan will be applied to every selected day.
                        </Typography>
                    )}

                    <SegmentedControl
                        fullWidth
                        disabled={readOnly}
                        value={dayType}
                        options={DAY_TYPE_OPTIONS}
                        onChange={(next) => {
                            setDayType(next);

                            if (next === DAY_TYPE.OFF) {
                                setTerritory("");
                                setArea("");
                            }
                        }}
                    />

                    {isWorking && (
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField
                                select
                                fullWidth
                                required
                                label="Territory"
                                value={territory}
                                disabled={readOnly || territories.length === 0}
                                onChange={(event) => {
                                    setTerritory(event.target.value);
                                    setArea("");
                                }}
                            >
                                {territories.map((item) => (
                                    <MenuItem key={item.TerritoryId} value={item.TerritoryId}>
                                        {item.TerritoryName}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                fullWidth
                                required
                                label="Area"
                                value={areas.some((item) => item.AreaId === area) ? area : ""}
                                disabled={readOnly || !territory || areasLoading}
                                helperText={
                                    territory && !areasLoading && areas.length === 0
                                        ? "No areas in this territory"
                                        : " "
                                }
                                onChange={(event) => setArea(event.target.value)}
                            >
                                {areas.map((item) => (
                                    <MenuItem key={item.AreaId} value={item.AreaId}>
                                        {item.AreaName}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    )}

                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={4}
                        label={isWorking ? "Remarks (optional)" : "Reason (optional)"}
                        placeholder={
                            isWorking ? "e.g. Hospital CME in the evening" : "e.g. Public holiday"
                        }
                        disabled={readOnly}
                        value={remarks}
                        onChange={(event) => setRemarks(event.target.value.slice(0, REMARKS_LIMIT))}
                        helperText={`${remarks.length}/${REMARKS_LIMIT}`}
                        slotProps={{ formHelperText: { sx: { textAlign: "right" } } }}
                    />
                </Stack>
            </DialogContent>

            <DialogActions
                sx={(theme) => ({
                    px: theme.dialog.paddingX,
                    pb: theme.dialog.paddingY,
                    pt: 1,
                    gap: 1,
                })}
            >
                {!readOnly && hasExistingPlan && (
                    <Button
                        color="error"
                        startIcon={<DeleteOutlineRounded />}
                        onClick={onClear}
                        sx={{ mr: "auto" }}
                    >
                        {single ? "Clear day" : "Clear days"}
                    </Button>
                )}

                <Button variant="outlined" onClick={onClose}>
                    {readOnly ? "Close" : "Cancel"}
                </Button>

                {!readOnly && (
                    <Button variant="contained" disabled={!canApply} onClick={handleApply}>
                        {single ? "Save day" : `Apply to ${dates.length} days`}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default DayPlanDialog;
