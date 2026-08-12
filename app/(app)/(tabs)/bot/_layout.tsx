import { Stack } from "expo-router";

export default function BotLayout() {
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
                    title: "Velg gruppe",
                    headerTitleAlign: "center",
                }}
            />
        </Stack>
    );
}
