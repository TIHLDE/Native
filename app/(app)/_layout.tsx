import { Stack } from 'expo-router';
import { ThemeToggle } from '@/components/themeToggle';

export default function AppLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
                name="profil"
                options={{
                    title: "Profil",
                    headerShown: true,
                    headerBackTitle: "Tilbake",
                    headerTitleAlign: "center",
                    headerRight: () => <ThemeToggle />,
                }}
            />
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
