import { useEffect, useState } from "react";

import api from "../../configurations/api-config";

// The signed-in person and the people they may see, from GET /app/people (names only, no phone or email):
//   users: me + my team (everyone for head office); colleagues: joint-work candidates.
const CHANGE_EVENT = "pharmalyx:acting-user";

const readStoredUserId = () => {
    const stored = localStorage.getItem("userId");

    if (!stored || stored === "undefined") {
        localStorage.removeItem("userId");
        return "";
    }

    return stored;
};

const lower = (value) => String(value || "").toLowerCase();

function useActingUser() {
    const [actingUserId, setActingUserIdState] = useState(readStoredUserId);
    const [people, setPeople] = useState({ me: null, team: [], colleagues: [] });

    useEffect(() => {
        api.get("/app/people")
            .then(({ data }) => setPeople({ me: data?.me || null, team: data?.team || [], colleagues: data?.colleagues || [] }))
            .catch(() => setPeople({ me: null, team: [], colleagues: [] }));
    }, [actingUserId]);

    // Keep every instance (header, pages) in sync when the session changes.
    useEffect(() => {
        const sync = () => setActingUserIdState(readStoredUserId());

        window.addEventListener(CHANGE_EVENT, sync);
        return () => window.removeEventListener(CHANGE_EVENT, sync);
    }, []);

    const setActingUserId = (value) => {
        localStorage.setItem("userId", value);
        setActingUserIdState(value);
        window.dispatchEvent(new Event(CHANGE_EVENT));
    };

    // Ids compare case-insensitively (the server returns upper-case GUIDs).
    const normalise = (list) => list.map((person) => ({ ...person, id: lower(person.id) === lower(actingUserId) ? actingUserId : person.id }));

    return {
        actingUserId,
        setActingUserId,
        me: people.me,
        users: normalise(people.team),
        colleagues: normalise(people.colleagues),
    };
}

export default useActingUser;
