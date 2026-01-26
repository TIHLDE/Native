import { Stack } from 'expo-router';

export default function AppLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
                name="(modals)"
                options={{
                    headerShown: false,
                    presentation: "card",
                    animation: "slide_from_right",
                }}
            />
        </Stack>
    );
}
