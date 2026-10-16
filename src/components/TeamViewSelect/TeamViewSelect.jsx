import { useEffect, useState } from "react";

import { MenuItem, TextField } from "@mui/material";

import { getMyTeam } from "../../Pages/MyDoctors/index";

// Who the page is showing: the acting user, or one of their direct reports.
export function useTeamView(actingUserId) {
    const [team, setTeam] = useState([]);
    const [viewUserId, setViewUserId] = useState(actingUserId);

    useEffect(() => {
        setViewUserId(actingUserId);
        setTeam([]);

        if (!actingUserId) return;

        getMyTeam()
            .then((response) => setTeam(response?.team || []))
            .catch(() => setTeam([]));
    }, [actingUserId]);

    const viewing = team.find((member) => member.UserId === viewUserId) || null;

    return {
        team,
        reports: team.filter((member) => !member.IsSelf),
        viewUserId,
        setViewUserId,
        viewing,
        viewingSelf: viewUserId === actingUserId,
        isManager: team.some((member) => !member.IsSelf),
    };
}

// Compact "Viewing" picker; renders nothing for users without a team.
function TeamViewSelect({ team, value, onChange }) {
    if (team.length < 2) return null;

    return (
        <TextField
            select
            size="small"
            label="Viewing"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            sx={(theme) => ({
                minWidth: theme.search.minWidth,
                "& .MuiOutlinedInput-root": { minHeight: theme.field.compactHeight },
                "& .MuiSelect-select": { py: 0 },
            })}
        >
            {team.map((member) => (
                <MenuItem key={member.UserId} value={member.UserId}>
                    {member.IsSelf ? "Me" : member.Name}
                    {member.DesignationName ? ` · ${member.DesignationName}` : ""}
                </MenuItem>
            ))}
        </TextField>
    );
}

export default TeamViewSelect;
