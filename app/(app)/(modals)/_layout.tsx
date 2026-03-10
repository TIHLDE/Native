import { Stack, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/lib/useColorScheme';

const modalScreenOptions = {
    presentation: "card" as const,
    animation: "slide_from_right" as const,
    headerBackTitle: "Tilbake" as const,
};

export default function ModalsLayout() {
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();
    const backColor = isDarkColorScheme ? "#ffffff" : "#000000";

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
                    headerLeft: () => (
                        <Pressable
                            onPress={() => router.back()}
                            className="flex-row items-center active:opacity-70 mr-2"
                        >
                            <ChevronLeft size={24} color={backColor} />
                            <Text className="text-base text-foreground">Tilbake</Text>
                        </Pressable>
                    ),
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
