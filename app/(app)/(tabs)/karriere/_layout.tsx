import { Stack } from "expo-router";
import FinesHeaderButton from "@/components/boter/FinesFAB";

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
                    // Profilen ligger i bunnlinja; her står bare bøtene.
                    headerRight: () => <FinesHeaderButton />,
                }}
            />
        </Stack>
    );
}
