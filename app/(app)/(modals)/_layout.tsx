import { Stack } from 'expo-router';

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
                    title: "QR-kode",
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="arrangement/[arrangementId]"
                options={{
                    ...modalScreenOptions,
                    headerShown: true,
                    title: "",
                }}
            />
            <Stack.Screen
                name="arrangement/[arrangementId]/event-register"
                options={{
                    ...modalScreenOptions,
                    title: "Registrer oppmøte",
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="boter/index"
                options={{
                    ...modalScreenOptions,
                    title: "Velg gruppe",
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="boter/[groupSlug]/index"
                options={{
                    ...modalScreenOptions,
                    title: "Velg lov",
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="boter/[groupSlug]/brukere"
                options={{
                    ...modalScreenOptions,
                    title: "Velg brukere",
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="boter/[groupSlug]/bekreft"
                options={{
                    ...modalScreenOptions,
                    title: "Gi bot",
                    headerShown: true,
                }}
            />
        </Stack>
    );
}
