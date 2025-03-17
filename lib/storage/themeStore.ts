import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "dark" | "light" | "system";

export async function storeTheme(theme: Theme): Promise<boolean> {
    try {
        await AsyncStorage.setItem("theme", JSON.stringify(theme ?? "system"));
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

export async function getTheme(): Promise<Theme> {
    try {
        let theme = await AsyncStorage.getItem("theme");
        return theme != null ? JSON.parse(theme) : "system";
    } catch (e) {
        console.error(e);
        return "system";
    }
}