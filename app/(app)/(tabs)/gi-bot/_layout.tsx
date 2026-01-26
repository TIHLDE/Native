import { Stack } from "expo-router";
import { getGlassMorphismHeaderOptions } from "@/lib/headerConfig";

export default function GiBotLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    ...getGlassMorphismHeaderOptions({
                        title: "Gi bot",
                        headerTitleAlign: "center",
                    }),
                    headerShown: true,
                } as any}
            />
        </Stack>
    );
}
