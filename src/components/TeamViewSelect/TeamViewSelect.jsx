import { useEffect, useState } from "react";

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

// Pages show the signed-in user's own data, so there is no "Viewing" picker.
// Kept as a no-op so existing pages need no changes; useTeamView still provides
// the team for manager actions (issuing stock, team reviews).
function TeamViewSelect() {
    return null;
}

export default TeamViewSelect;
