import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { storeTheme } from './storage/themeStore';

export function useColorScheme() {
    const { colorScheme, setColorScheme: setNativewindColorScheme, toggleColorScheme: toggleNativewindColorScheme } =
        useNativewindColorScheme();

    const setColorScheme = (theme: "light" | "dark" | "system") => {
        storeTheme(theme);
        setNativewindColorScheme(theme);
    }

    const toggleColorScheme = () => {
        storeTheme(colorScheme === "dark" ? "light" : "dark");
        toggleNativewindColorScheme();
    }

    return {
        colorScheme: colorScheme ?? 'dark',
        isDarkColorScheme: colorScheme === 'dark',
        setColorScheme,
        toggleColorScheme,
    };
}