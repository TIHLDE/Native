import FinesHeaderButton from "@/components/boter/FinesFAB";
import { Stack } from "expo-router";

export default function ArrangementerLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: true,
                    title: "Arrangementer",
                    headerTitleAlign: "center",
                    // Profilen ligger i bunnlinja; her står bare bøtene.
                    headerRight: () => <FinesHeaderButton />,
                }}
            />
        </Stack>
    );
}
