import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useAuth } from "@/context/auth";
import { toAppRoute } from "@/lib/notifications/link";
import { registerForPushNotifications } from "@/lib/notifications/push";

/**
 * Kobler appen til push-varsler: melder telefonen på når noen er logget inn,
 * og åpner riktig skjerm når et varsel trykkes.
 *
 * Rendrer ingenting — den ligger som en egen komponent fordi den trenger både
 * innloggingsstatus og ruteren, og rot-layouten skal fortsatt være lesbar.
 */
export function PushNotifications() {
    const { authState } = useAuth();
    const authenticated = authState?.auhtenticated ?? false;
    const router = useRouter();

    // Dekker både trykk mens appen kjører og trykket som startet appen fra
    // helt lukket tilstand — det siste finnes ikke som hendelse å lytte på.
    const lastResponse = Notifications.useLastNotificationResponse();
    const handled = useRef<string | null>(null);

    useEffect(() => {
        // Tokenet kan byttes ut av systemet, så påmeldingen gjentas hver gang
        // appen starter med en innlogget bruker framfor bare ved innlogging.
        if (!authenticated) return;
        registerForPushNotifications();
    }, [authenticated]);

    useEffect(() => {
        if (!authenticated || !lastResponse) return;

        // Hooken gir samme svar på nytt ved hver re-render. Uten denne
        // sperren ville skjermen bli åpnet om igjen så lenge appen lever.
        const id = lastResponse.notification.request.identifier;
        if (handled.current === id) return;
        handled.current = id;

        const { link } = lastResponse.notification.request.content.data as {
            link?: string | null;
        };

        let cancelled = false;
        toAppRoute(link).then((route) => {
            if (!cancelled && route) router.push(route as never);
        });

        return () => {
            cancelled = true;
        };
    }, [authenticated, lastResponse, router]);

    return null;
}
