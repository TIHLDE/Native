import { Stack } from "expo-router";

export default function arrangementerLayout() {

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: true, title: "Arrangementer" }} />
        </Stack>
    )
}