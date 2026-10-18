import { useEffect, useState } from "react";

import { Box, MenuItem, TextField } from "@mui/material";

import PageHeader from "../../components/PageHeader/PageHeader";
import SegmentedControl from "../../components/SegmentedControl/SegmentedControl";
import { getPeople } from "./index";
import ExpiryTab from "./tracker/ExpiryTab";
import IncentivesTab from "./tracker/IncentivesTab";
import RampTab from "./tracker/RampTab";
import ReviewTab from "./tracker/ReviewTab";

const TABS = [
    { value: "review", label: "Monthly review" },
    { value: "ramp", label: "Ramp-up & cost" },
    { value: "incentives", label: "Incentives" },
    { value: "expiry", label: "Near expiry" },
];

// Business tracking: what the company gets back for each MR, measured on net sales (after returns).
// Same numbers for the MR, their manager and head office; nobody can edit them here.
function Tracker() {
    const [tab, setTab] = useState("review");
    const [people, setPeople] = useState([]);
    const [userId, setUserId] = useState("");

    useEffect(() => {
        getPeople()
            .then((result) => setPeople(result.users || []))
            .catch(() => {});
    }, []);

    return (
        <Box>
            <PageHeader
                eyebrow="Sales & distribution · Business tracker"
                title="Business tracker"
                subtitle="Net sales (dispatch − returns and expiry), ramp-up milestones, cost vs business and incentives. View only."
                actions={
                    people.length > 1 && (
                        <TextField
                            select
                            size="small"
                            label="Employee"
                            value={userId}
                            onChange={(event) => setUserId(event.target.value)}
                            slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
                            sx={(theme) => ({ minWidth: theme.spacing(28) })}
                        >
                            <MenuItem value="">Me</MenuItem>
                            {people.map((person) => (
                                <MenuItem key={person.UserId} value={person.UserId}>
                                    {person.Name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )
                }
            />
            <Box sx={(theme) => ({ mb: theme.stat.gap, overflowX: "auto" })}>
                <SegmentedControl value={tab} onChange={setTab} options={TABS} />
            </Box>

            {tab === "review" && <ReviewTab userId={userId} />}
            {tab === "ramp" && <RampTab userId={userId} />}
            {tab === "incentives" && <IncentivesTab userId={userId} />}
            {tab === "expiry" && <ExpiryTab userId={userId} />}
        </Box>
    );
}

export default Tracker;
