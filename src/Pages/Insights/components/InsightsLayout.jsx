import { Autocomplete, Box, TextField } from "@mui/material";

import LoadError from "../../../components/LoadError/LoadError";
import PageHeader from "../../../components/PageHeader/PageHeader";
import useReportOptions from "../../Reports/components/useReportOptions";

// Employee picker (yourself or anyone in your hierarchy); hidden when you have no team.
export function EmployeePicker({ value, onChange }) {
    const options = useReportOptions();
    const users = options?.users || [];

    if (users.length <= 1) return null;

    return (
        <Autocomplete
            size="small"
            options={users}
            value={users.find((user) => user.UserId === value) || null}
            onChange={(event, user) => onChange(user?.UserId || "")}
            getOptionLabel={(user) => (user.IsSelf ? `${user.Name} (me)` : user.Name)}
            isOptionEqualToValue={(option, selected) => option.UserId === selected.UserId}
            sx={(theme) => ({ minWidth: theme.insights.pickerWidth })}
            renderInput={(params) => <TextField {...params} label="Employee" placeholder="Everyone in my team" />}
        />
    );
}

// Page frame: header (+ employee picker and extra actions), error state, loading fade.
export function InsightsLayout({ title, subtitle, state, actions, children }) {
    return (
        <Box>
            <PageHeader
                eyebrow="Insights"
                title={title}
                subtitle={subtitle}
                actions={
                    <>
                        <EmployeePicker value={state.userId} onChange={state.setUserId} />
                        {actions}
                    </>
                }
            />

            {state.error ? (
                <LoadError title={`Couldn't load ${title.toLowerCase()}`} message={state.error} onRetry={state.reload} />
            ) : (
                <Box sx={(theme) => ({ opacity: state.loading ? theme.table.loadingOpacity : 1, transition: theme.calendar.transition })}>{state.data && children(state.data)}</Box>
            )}
        </Box>
    );
}
