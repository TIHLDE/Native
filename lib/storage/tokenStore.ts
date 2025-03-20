import * as SectureStore from "expo-secure-store";

const ACCESS_TOKEN = "tihlde_access_token";

export async function getToken(): Promise<string | null> {
    return await SectureStore.getItemAsync(ACCESS_TOKEN);
};

export async function setToken(token: string): Promise<void> {
    await SectureStore.setItemAsync(ACCESS_TOKEN, token);
};

export async function deleteToken(): Promise<boolean> {
    try {
        await SectureStore.deleteItemAsync(ACCESS_TOKEN);
        return true;
    } catch (error) {
        return false;
    }
};