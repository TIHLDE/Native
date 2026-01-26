import { Stack } from "expo-router";

export default function profilLayout() {

    return (
        <Stack>
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