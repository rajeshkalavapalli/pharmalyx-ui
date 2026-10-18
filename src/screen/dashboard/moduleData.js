import { useEffect, useState } from "react";

import api from "../../configurations/api-config";

const getModule = async (section, scope) => (await api.get(`/app/dashboard/modules/${section}`, { params: { scope } })).data;

// One dashboard module (stats + charts) for my team or my work. Pass section = null to skip loading.
// Returns { data, failed }.
export function useModuleData(section, team) {
    const [state, setState] = useState({ key: null, data: null, failed: false });
    const key = section ? `${section}:${team ? "team" : "me"}` : null;

    useEffect(() => {
        if (!section) return undefined;
        let live = true;
        getModule(section, team ? "team" : "me")
            .then((data) => live && setState({ key: `${section}:${team ? "team" : "me"}`, data, failed: false }))
            .catch(() => live && setState({ key: `${section}:${team ? "team" : "me"}`, data: null, failed: true }));
        return () => {
            live = false;
        };
    }, [section, team]);

    // Data from another tab or scope never shows while the new one loads.
    return state.key === key ? { data: state.data, failed: state.failed } : { data: null, failed: false };
}

// Stat from a module by its icon key (e.g. "visits"), or undefined.
export const findStat = (data, icon) => data?.stats?.find((s) => s.icon === icon);

// Six-month series of a module chart by key, as plain numbers.
export const chartSeries = (data, key) => data?.charts?.find((c) => c.key === key)?.items.map((i) => i.value);
