import { useCallback, useEffect, useRef, useState } from "react";

import { QUEUE_STORAGE_KEY, createVisit, readQueue, writeQueue } from "./index";

const RETRY_INTERVAL_MS = 30000;

const responseMessage = (error) =>
    error.response?.data?.message || error.message || "The server rejected this visit";

// Offline queue for visits. Visits carry their own id, so re-sending one that
// already reached the server is harmless (the API answers "already saved").
function useVisitSync({ onSynced } = {}) {
    const [online, setOnline] = useState(() => globalThis.navigator?.onLine ?? true);
    const [queue, setQueue] = useState(readQueue);
    const [syncing, setSyncing] = useState(false);

    const syncingRef = useRef(false);
    const onSyncedRef = useRef(onSynced);

    useEffect(() => {
        onSyncedRef.current = onSynced;
    }, [onSynced]);

    const refresh = useCallback(() => setQueue(readQueue()), []);

    const update = useCallback((transform) => {
        const next = transform(readQueue());
        writeQueue(next);
        setQueue(next);
    }, []);

    const enqueue = useCallback(
        (item) =>
            update((current) => [
                ...current.filter((entry) => entry.payload.VisitId !== item.payload.VisitId),
                { ...item, queuedAt: new Date().toISOString() },
            ]),
        [update]
    );

    const discard = useCallback(
        (visitId) => update((current) => current.filter((entry) => entry.payload.VisitId !== visitId)),
        [update]
    );

    const syncNow = useCallback(async () => {
        if (syncingRef.current || !globalThis.navigator?.onLine) return;

        const pending = readQueue().filter((entry) => !entry.error);

        if (pending.length === 0) return;

        syncingRef.current = true;
        setSyncing(true);

        let synced = 0;

        try {
            for (const entry of pending) {
                try {
                    await createVisit(entry.payload, entry.userId);

                    update((current) =>
                        current.filter((item) => item.payload.VisitId !== entry.payload.VisitId)
                    );
                    synced += 1;
                } catch (error) {
                    // No response means we are effectively offline: stop and retry later.
                    if (!error.response) break;

                    // The server refused it; keep it for the user to review.
                    update((current) =>
                        current.map((item) =>
                            item.payload.VisitId === entry.payload.VisitId
                                ? { ...item, error: responseMessage(error) }
                                : item
                        )
                    );
                }
            }
        } finally {
            syncingRef.current = false;
            setSyncing(false);
        }

        if (synced > 0) {
            onSyncedRef.current?.(synced);
        }
    }, [update]);

    const retry = useCallback(
        (visitId) => {
            update((current) =>
                current.map((item) =>
                    item.payload.VisitId === visitId ? { ...item, error: undefined } : item
                )
            );
            syncNow();
        },
        [update, syncNow]
    );

    // Connectivity and other tabs.
    useEffect(() => {
        const goOnline = () => {
            setOnline(true);
            syncNow();
        };
        const goOffline = () => setOnline(false);
        const onStorage = (event) => {
            if (event.key === QUEUE_STORAGE_KEY) refresh();
        };

        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);
        window.addEventListener("storage", onStorage);

        syncNow();

        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
            window.removeEventListener("storage", onStorage);
        };
    }, [syncNow, refresh]);

    // "Online" does not guarantee the server is reachable, so retry periodically.
    const hasPending = queue.some((entry) => !entry.error);

    useEffect(() => {
        if (!online || !hasPending) return undefined;

        const timer = window.setInterval(syncNow, RETRY_INTERVAL_MS);
        return () => window.clearInterval(timer);
    }, [online, hasPending, syncNow]);

    return { online, queue, syncing, enqueue, discard, retry, syncNow };
}

export default useVisitSync;
