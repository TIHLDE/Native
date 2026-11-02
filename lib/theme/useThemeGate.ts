import { useEffect, useState } from "react";
import type { ThemePreference } from "@/lib/storage/themeStore";

/** Hvor lenge appen venter på at NativeWind bekrefter temaet før den vises likevel. */
export const THEME_GATE_TIMEOUT_MS = 500;

/**
 * Om appen kan rendres, gitt temaet som er lagret og temaet NativeWind viser.
 *
 * NativeWind får vite om det nye temaet først når endringen fra systemet
 * kommer tilbake, litt etter `setColorScheme`. Rendres appen før det, får
 * komponenter som er midt i sin første render en oppdatering React avviser,
 * og de kan bli stående med feil tema. Vent derfor til temaet faktisk er satt.
 *
 * Flagget settes bare én gang og aldri tilbake: når temaet byttes i
 * innstillingene skal appen bli stående. Kommer bekreftelsen aldri, slipper
 * tidsfristen appen fram likevel, så den ikke henger på en tom skjerm.
 */
export function useThemeGate(
    pendingTheme: ThemePreference | null,
    colorScheme: "light" | "dark",
): boolean {
    const [isLoaded, setIsLoaded] = useState(false);

    const isConfirmed =
        pendingTheme !== null && (pendingTheme === "system" || colorScheme === pendingTheme);
    if (isConfirmed && !isLoaded) {
        setIsLoaded(true);
    }

    useEffect(() => {
        if (isLoaded || pendingTheme === null) return;
        const timeout = setTimeout(() => {
            console.warn(
                `NativeWind bekreftet ikke temaet innen ${THEME_GATE_TIMEOUT_MS} ms, viser appen likevel.`,
            );
            setIsLoaded(true);
        }, THEME_GATE_TIMEOUT_MS);
        return () => clearTimeout(timeout);
    }, [pendingTheme, isLoaded]);

    return isLoaded;
}
