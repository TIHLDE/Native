import { Stack } from "expo-router";
import { getGlassMorphismHeaderOptions } from "@/lib/headerConfig";

export default function ArrangementerLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    ...getGlassMorphismHeaderOptions({
                        title: "Arrangementer",
                        headerTitleAlign: "center",
                    }),
                    headerShown: true,
                }}
            />
        </Stack>
    );
}
