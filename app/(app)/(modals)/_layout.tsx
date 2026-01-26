import { Stack } from 'expo-router';
import { getGlassMorphismHeaderOptions } from "@/lib/headerConfig";

const modalScreenOptions = {
    presentation: "card" as const,
    animation: "slide_from_right" as const,
    headerBackTitle: "Tilbake" as const,
};

export default function ModalsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="qrmodal"
                options={{
                    ...modalScreenOptions,
                    ...getGlassMorphismHeaderOptions({
                        title: "QR-kode",
                    }),
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="arrangement/[arrangementId]"
                options={{
                    ...modalScreenOptions,
                    ...getGlassMorphismHeaderOptions({
                        title: "",
                    }),
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="arrangement/[arrangementId]/event-register"
                options={{
                    ...modalScreenOptions,
                    ...getGlassMorphismHeaderOptions({
                        title: "Registrer oppmøte",
                    }),
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="settings"
                options={{
                    ...modalScreenOptions,
                    ...getGlassMorphismHeaderOptions({
                        title: "Innstillinger",
                    }),
                    headerShown: true,
                }}
            />
        </Stack>
    );
}
