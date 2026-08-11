import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/auth';

export default function AppLayout() {
    const { authState } = useAuth();

    /**
     * Innloggingen ble bare sjekket på splash-skjermen, altså én gang, ved
     * oppstart. Røk sesjonen mens appen var åpen, ble brukeren stående inne i
     * fanene med en feilmelding på hver side — også på profilen, der «Logg ut»
     * ligger. Sjekken hører hjemme her, der alle sidene bor.
     */
    if (authState?.isLoading) return null;
    if (!authState?.auhtenticated) return <Redirect href="/login" />;

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, headerBackTitle: "Tilbake" }} />
            <Stack.Screen
                name="(modals)"
                options={{
                    headerShown: false,
                    presentation: "card",
                    animation: "slide_from_right",
                }}
            />
        </Stack>
    );
}
