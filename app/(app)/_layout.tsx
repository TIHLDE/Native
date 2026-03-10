import { Stack } from 'expo-router';
import { View } from 'react-native';
import { ThemeToggle } from '@/components/themeToggle';
import FinesHeaderButton from '@/components/boter/FinesFAB';

export default function AppLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, headerBackTitle: "Tilbake" }} />
            <Stack.Screen
                name="profil"
                options={{
                    title: "Profil",
                    headerShown: true,
                    headerBackTitle: "Tilbake",
                    headerTitleAlign: "center",
                    headerRight: () => (
                        <View className="flex-row items-center">
                            <FinesHeaderButton />
                            <ThemeToggle />
                        </View>
                    ),
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
