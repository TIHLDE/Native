import { Stack } from "expo-router";

export default function QrKodeLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "QR-kode"
                }}
            />
        </Stack>
    );
}
