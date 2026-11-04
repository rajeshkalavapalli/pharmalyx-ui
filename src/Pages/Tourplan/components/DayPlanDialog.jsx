import { useEffect, useState } from "react";

import {
    Alert,
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
    GroupsRounded,
    WorkOutlineRounded,
} from "@mui/icons-material";

import SegmentedControl from "../../../components/SegmentedControl/SegmentedControl";
import { getAreasByTerritory } from "../../Doctors/index";
import { DAY_TYPE, REMARKS_LIMIT, describeDates, formatDayLabel } from "../index";

const JOINT = "joint";
const DAY_TYPE_OPTIONS = [
    { value: DAY_TYPE.WORKING, label: "Working day", icon: WorkOutlineRounded },
    { value: DAY_TYPE.OFF, label: "Off / Leave", icon: EventBusyRounded },
];
// Seniors also plan joint work with a team member: the area comes from the member's plan.
const JOINT_OPTION = { value: JOINT, label: "Joint work", icon: GroupsRounded };

// Mounted fresh (via `key`) for each selection, so initial state comes from props.
function DayPlanDialog({
    open,
    dates,
    initialPlan,
    hasExistingPlan,
    territories,
    readOnly,
    team = [],
    lockedBy = "",
    onMoveMemberDay,
    onClose,
    onApply,
    onClear,
}) {
    const [dayType, setDayType] = useState(initialPlan?.jointWith ? JOINT : lockedBy ? DAY_TYPE.WORKING : initialPlan?.dayType || DAY_TYPE.WORKING);
    // A day a senior planned with me: I can only fill in the area while it is still empty.
    const lockedArea = Boolean(lockedBy) && Boolean(initialPlan?.area);
    const [jointWith, setJointWith] = useState(initialPlan?.jointWith || "");
    const [moving, setMoving] = useState(false); // changing the team member's area
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

    const isJoint = dayType === JOINT;
    const isWorking = dayType === DAY_TYPE.WORKING || (isJoint && moving);
    const canApply = isJoint ? Boolean(jointWith) : !isWorking || (territory && area);
    const single = dates.length === 1;
    const member = team.find((item) => item.id === jointWith);
    // Moving a member's area is for one saved joint day with that member.
    const canMove = single && isJoint && jointWith && initialPlan?.jointWith === jointWith && onMoveMemberDay;
    const options = team.length ? [...DAY_TYPE_OPTIONS, JOINT_OPTION] : DAY_TYPE_OPTIONS;

    const handleApply = () => {
        if (isJoint) {
            onApply({
                dayType: DAY_TYPE.WORKING,
                jointWith,
                jointWithName: member?.name || initialPlan?.jointWithName || "",
                territory: "",
                area: "",
                territoryName: initialPlan?.jointWith === jointWith ? initialPlan.territoryName : "",
                areaName: initialPlan?.jointWith === jointWith ? initialPlan.areaName : "",
                remarks: remarks.trim(),
            });
            return;
        }

        const territoryName =
            territories.find((item) => item.TerritoryId === territory)?.TerritoryName || "";
        const areaName = areas.find((item) => item.AreaId === area)?.AreaName || "";

        onApply({
            dayType,
            jointWith: "",
            jointWithName: "",
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

                    {lockedBy && (
                        <Alert severity="info" icon={<GroupsRounded />}>
                            {lockedBy} planned joint work with you on this day. {lockedArea ? "Ask them to change it." : "Choose the area you will work in; it can't be an off day."}
                        </Alert>
                    )}

                    <SegmentedControl
                        fullWidth
                        disabled={readOnly || Boolean(lockedBy)}
                        value={dayType}
                        options={options}
                        onChange={(next) => {
                            setDayType(next);
                            setMoving(false);

                            if (next !== DAY_TYPE.WORKING) {
                                setTerritory("");
                                setArea("");
                            }
                        }}
                    />

                    {isJoint && (
                        <Stack spacing={1.5}>
                            <TextField
                                select
                                fullWidth
                                required
                                label="Joint work with"
                                value={team.some((item) => item.id === jointWith) ? jointWith : ""}
                                disabled={readOnly}
                                onChange={(event) => {
                                    setJointWith(event.target.value);
                                    setMoving(false);
                                }}
                                helperText="They work with you that day; their planned area is used. Their off days, Sundays and leave can't be chosen."
                            >
                                {team.map((item) => (
                                    <MenuItem key={item.id} value={item.id}>
                                        {item.designation ? `${item.name} · ${item.designation}` : item.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {initialPlan?.jointWith === jointWith && (
                                <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary })}>
                                    {initialPlan.areaName
                                        ? `Area from their plan: ${initialPlan.territoryName} · ${initialPlan.areaName}`
                                        : "They have not planned this day yet; the area follows their plan."}
                                    {initialPlan.jointStatus === "DECLINED" && " Cancelled because of their leave: please replan this day."}
                                </Typography>
                            )}

                            {canMove && !moving && !readOnly && (
                                <Button variant="outlined" size="small" sx={{ alignSelf: "flex-start" }} onClick={() => setMoving(true)}>
                                    Change {member?.name || "their"}'s area for this day
                                </Button>
                            )}
                        </Stack>
                    )}

                    {isWorking && (
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField
                                select
                                fullWidth
                                required
                                label="Territory"
                                value={territory}
                                disabled={readOnly || lockedArea || territories.length === 0}
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
                                disabled={readOnly || lockedArea || !territory || areasLoading}
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

                {!readOnly && isJoint && moving && (
                    <Button
                        variant="contained"
                        disabled={!territory || !area}
                        onClick={() => onMoveMemberDay(jointWith, dates[0], territory, area)}
                    >
                        Move their day
                    </Button>
                )}

                {!readOnly && !lockedArea && !(isJoint && moving) && (
                    <Button variant="contained" disabled={!canApply} onClick={handleApply}>
                        {single ? "Save day" : `Apply to ${dates.length} days`}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default DayPlanDialog;
