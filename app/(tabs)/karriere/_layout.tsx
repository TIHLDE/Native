import { Stack } from "expo-router";

export default function karriereLayout() {

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false, title: "Karriere" }} />
        </Stack>
    )
}