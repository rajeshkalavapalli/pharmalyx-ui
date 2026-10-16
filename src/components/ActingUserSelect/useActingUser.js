import { useEffect, useState } from "react";

import { getUsers } from "../../Pages/Users/service/index";

// Temporary until login stores the signed-in user: the API identifies the
// acting user from localStorage.userId (sent as the x-user-id header).
const CHANGE_EVENT = "pharmalyx:acting-user";

const readStoredUserId = () => {
    const stored = localStorage.getItem("userId");

    if (!stored || stored === "undefined") {
        localStorage.removeItem("userId");
        return "";
    }

    return stored;
};

function useActingUser() {
    const [actingUserId, setActingUserIdState] = useState(readStoredUserId);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        getUsers()
            .then((response) => {
                const data = response?.result || response || [];

                setUsers(
                    (Array.isArray(data) ? data : []).map((user) => ({
                        id: user.userId || user.UserId,
                        name:
                            [user.FirstName, user.LastName].filter(Boolean).join(" ") ||
                            user.UserName,
                    }))
                );
            })
            .catch(() => setUsers([]));
    }, []);

    // Keep every instance (header, pages) in sync when the user is switched.
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

    return { actingUserId, setActingUserId, users };
}

export default useActingUser;
