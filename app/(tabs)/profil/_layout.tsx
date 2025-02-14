import { Stack } from "expo-router";

export default function karriereLayout() {

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false, title: "Profil" }} />
            <Stack.Screen name="qrmodal" options={{ presentation: "modal", title: "Qr-kode" }} />
            <Stack.Screen name="eventmodal" options={{ presentation: "card" }} />
        </Stack>
    )
}