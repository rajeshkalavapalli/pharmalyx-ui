import { useEffect, useState } from "react";

import api from "./api-config";
import { getToken } from "./session";

// The signed-in person's permission codes (GET /app/me/permissions), as a Set; null while loading.
// Kept per session token so every screen shares one request.
let cache = { token: null, promise: null };

const load = () => {
    const token = getToken();
    if (cache.token !== token || !cache.promise) {
        cache = {
            token,
            promise: api
                .get("/app/me/permissions")
                .then(({ data }) => new Set(data?.permissions || []))
                .catch(() => {
                    cache = { token: null, promise: null };
                    return new Set();
                }),
        };
    }
    return cache.promise;
};

function usePermissions() {
    const [permissions, setPermissions] = useState(null);

    useEffect(() => {
        let active = true;
        load().then((set) => active && setPermissions(set));
        return () => {
            active = false;
        };
    }, []);

    return permissions;
}

export default usePermissions;
