import { Stack } from "expo-router";
import { getGlassMorphismHeaderOptions } from "@/lib/headerConfig";

export default function KarriereLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    ...getGlassMorphismHeaderOptions({
                        title: "Jobbannonser",
                        headerTitleAlign: "center",
                    }),
                    headerShown: true,
                }}
            />
        </Stack>
    );
}
