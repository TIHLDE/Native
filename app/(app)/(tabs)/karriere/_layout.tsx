import { Stack } from "expo-router";
import { NotificationBell } from "@/components/notifications/NotificationBell";

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
                    headerRight: () => <NotificationBell />,
                }}
            />
        </Stack>
    );
}
