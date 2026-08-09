import { Stack } from "expo-router";
import FinesHeaderButton from "@/components/boter/FinesFAB";

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
                    headerRight: () => <FinesHeaderButton />,
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
