/**
 * Fargene fra nettsiden, som rene strenger.
 *
 * Samme verdier som `global.css`, bare i hex: en del props tar ikke en
 * NativeWind-klasse — `color` på lucide-ikonene, `placeholderTextColor`,
 * gradienter, SVG-fill — og før dette lå de som løse hex-literaler spredt over
 * skjermene. De hadde drevet fra hverandre og fra nettsiden.
 *
 * Fasiten er `packages/ui/src/styles.css` i Photon-monorepoet. Endres en farge
 * der, endres den her og i `global.css`.
 */
export type ThemeColors = {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    muted: string;
    mutedForeground: string;
    destructive: string;
    border: string;
    input: string;
};

const LIGHT: ThemeColors = {
    background: "#ffffff",
    foreground: "#0a0a0a",
    card: "#ffffff",
    cardForeground: "#0a0a0a",
    popover: "#ffffff",
    primary: "#1c458a",
    primaryForeground: "#fafafa",
    secondary: "#f5f5f5",
    muted: "#f5f5f5",
    mutedForeground: "#737373",
    destructive: "#e7000b",
    border: "#e5e5e5",
    input: "#e5e5e5",
};

const DARK: ThemeColors = {
    background: "#030b1a",
    foreground: "#f5f7f9",
    card: "#061532",
    cardForeground: "#f5f7f9",
    popover: "#091f49",
    primary: "#1b61e4",
    primaryForeground: "#ffffff",
    secondary: "#0d3172",
    muted: "#0d3172",
    mutedForeground: "#5d8bdf",
    destructive: "#ff6467",
    border: "#0d3172",
    input: "#0d3172",
};

/**
 * Paletten for gjeldende modus. Tar flagget skjermene allerede har fra
 * `useColorScheme()`, framfor å lese temaet en gang til.
 */
export function themeColors(isDarkColorScheme: boolean): ThemeColors {
    return isDarkColorScheme ? DARK : LIGHT;
}
