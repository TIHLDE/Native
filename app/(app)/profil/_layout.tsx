import { Stack } from "expo-router";

export default function profilLayout() {

    return (
        <Stack screenOptions={{ headerBackTitle: "" }}>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "Profil"
                }}
            />
        </Stack>
    )
}