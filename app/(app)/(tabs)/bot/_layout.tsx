import { Stack } from "expo-router";
import { NotificationBell } from "@/components/notifications/NotificationBell";

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
                    headerRight: () => <NotificationBell />,
                }}
            />
        </Stack>
    );
}
