import { Stack } from "expo-router";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export default function UtleggLayout() {
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
                    title: "Utlegg",
                    headerBackTitle: "Tilbake",
                    headerTitleAlign: "center",
                    headerRight: () => <NotificationBell />,
                }}
            />
            <Stack.Screen
                name="nytt"
                options={{
                    headerShown: true,
                    title: "Nytt utlegg",
                    headerTitleAlign: "center",
                }}
            />
        </Stack>
    );
}
