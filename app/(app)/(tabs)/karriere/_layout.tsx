import { Stack } from "expo-router";

export default function KarriereLayout() {
    return (
        <Stack
            screenOptions={{
                headerBackTitle: "Tilbake",
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: true,
                    title: "Jobbannonser",
                    headerBackTitle: "Tilbake",
                    headerTitleAlign: "center",
                }}
            />
        </Stack>
    );
}
