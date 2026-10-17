import { useEffect, useState } from "react";

import { getReportOptions } from "../index";

// Filter options are the same for every report, so load them once per session.
let cachedOptions = null;

function useReportOptions() {
    const [options, setOptions] = useState(cachedOptions);

    useEffect(() => {
        if (cachedOptions) return;

        let active = true;
        getReportOptions()
            .then((response) => {
                cachedOptions = response;
                if (active) setOptions(response);
            })
            .catch(() => {
                if (active) setOptions({ users: [], territories: [], products: [], viewAll: false });
            });

        return () => {
            active = false;
        };
    }, []);

    return options;
}

export default useReportOptions;
