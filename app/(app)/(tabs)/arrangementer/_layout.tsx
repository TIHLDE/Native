import { Stack } from "expo-router";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export default function ArrangementerLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: true,
                    title: "Arrangementer",
                    headerTitleAlign: "center",
                    headerRight: () => <NotificationBell />,
                }}
            />
        </Stack>
    );
}
