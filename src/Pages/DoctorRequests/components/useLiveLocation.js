import { useCallback, useEffect, useRef, useState } from "react";

// =========================================================
// Live GPS: watches the position until it is accurate enough (or times out) and keeps the best fix.
// =========================================================

const GOOD_ACCURACY = 30; // metres
const GPS_TIMEOUT = 20000;

function useLiveLocation() {
    const [state, setState] = useState({ status: "IDLE" });
    const watchRef = useRef(null);
    const timerRef = useRef(null);

    const stop = useCallback(() => {
        if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
        clearTimeout(timerRef.current);
        watchRef.current = null;
    }, []);

    const start = useCallback(() => {
        if (!navigator.geolocation) {
            setState({ status: "UNAVAILABLE" });
            return;
        }
        stop();
        setState({ status: "SEARCHING" });

        watchRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const fix = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy };
                setState((current) => {
                    const best = !current.fix || fix.accuracy < current.fix.accuracy ? fix : current.fix;
                    return { status: best.accuracy <= GOOD_ACCURACY ? "CAPTURED" : "SEARCHING", fix: best };
                });
            },
            (error) => {
                stop();
                setState({ status: error.code === error.PERMISSION_DENIED ? "DENIED" : "UNAVAILABLE" });
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: GPS_TIMEOUT }
        );

        // After the timeout, accept the best fix so far (the server flags weak accuracy).
        timerRef.current = setTimeout(() => {
            stop();
            setState((current) => (current.fix ? { status: "CAPTURED", fix: current.fix } : { status: "UNAVAILABLE" }));
        }, GPS_TIMEOUT);
    }, [stop]);

    useEffect(() => stop, [stop]);
    useEffect(() => {
        if (state.status === "CAPTURED") stop();
    }, [state.status, stop]);

    return { ...state, start };
}

export default useLiveLocation;
