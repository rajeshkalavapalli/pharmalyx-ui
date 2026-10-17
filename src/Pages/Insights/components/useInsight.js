import { useCallback, useEffect, useState } from "react";

import { errorMessage } from "../index";

// Loads `load(userId)` on mount and whenever the employee changes.
function useInsight(load) {
    const [userId, setUserId] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const reload = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            setData(await load(userId));
        } catch (err) {
            setData(null);
            setError(errorMessage(err, "Failed to load insights"));
        } finally {
            setLoading(false);
        }
    }, [load, userId]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { userId, setUserId, data, loading, error, reload };
}

export default useInsight;
