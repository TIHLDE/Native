import { Stack } from "expo-router";
import { View } from "react-native";
import { ThemeToggle } from "@/components/themeToggle";
import FinesHeaderButton from "@/components/boter/FinesFAB";

export default function ProfilLayout() {
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
                    title: "Profil",
                    headerTitleAlign: "center",
                    headerRight: () => (
                        <View className="flex-row items-center">
                            <FinesHeaderButton />
                            <ThemeToggle />
                        </View>
                    ),
                }}
            />
        </Stack>
    );
}
