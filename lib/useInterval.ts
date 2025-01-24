import { EffectCallback } from "expo-router";
import { useEffect, useRef } from "react";

export default function useInterval(callback: EffectCallback, msDelay: number | null) {
    const savedCallback = useRef<EffectCallback>();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            if (savedCallback.current) {
                savedCallback.current();
            }
        }

        if (msDelay) {
            const id = setInterval(tick, msDelay);
            return () => clearInterval(id);
        }
    }, [msDelay]);
}