import { useEffect, useState } from "react";

import api from "./api-config";
import { getToken } from "./session";

// The signed-in person's permission codes (GET /app/me/permissions), as a Set; null while loading.
// Shared per session token so every screen makes one request. A failed request (server restarting,
// network blip) is never kept: it is retried, so the menu never stays trimmed by a passing error.
const RETRY_MS = 3000;

let cache = { token: null, promise: null };

const load = () => {
    const token = getToken();
    if (cache.token !== token || !cache.promise) {
        const promise = api.get("/app/me/permissions").then(({ data }) => new Set(data?.permissions || []));
        cache = { token, promise };
        promise.catch(() => {
            if (cache.promise === promise) cache = { token: null, promise: null };
        });
    }
    return cache.promise;
};

function usePermissions() {
    const [permissions, setPermissions] = useState(null);

    useEffect(() => {
        let active = true;
        let timer = null;

        const attempt = () =>
            load()
                .then((set) => active && setPermissions(set))
                .catch(() => {
                    if (active) timer = setTimeout(attempt, RETRY_MS);
                });

        attempt();
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, []);

    return permissions;
}

export default usePermissions;
