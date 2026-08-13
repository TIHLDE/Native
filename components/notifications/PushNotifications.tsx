import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth";
import { toAppRoute } from "@/lib/notifications/link";
import { notificationKeys } from "@/lib/notifications/queries";
import { registerForPushNotifications } from "@/lib/notifications/push";
import { markPushNotificationRead } from "@/lib/notifications/read-push";

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
    const queryClient = useQueryClient();

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

        const content = lastResponse.notification.request.content;
        const { link, notificationId } = content.data as {
            link?: string | null;
            notificationId?: string | null;
        };

        let cancelled = false;

        // Å trykke på varselet er å ha sett det, så det markeres som lest selv
        // om appen ikke har en skjerm å sende brukeren til.
        markPushNotificationRead({
            notificationId,
            title: content.title,
            body: content.body,
            link,
        }).then((marked) => {
            if (marked && !cancelled) {
                queryClient.invalidateQueries({
                    queryKey: notificationKeys.list,
                });
            }
        });

        toAppRoute(link).then((route) => {
            if (!cancelled && route) router.push(route as never);
        });

        return () => {
            cancelled = true;
        };
    }, [authenticated, lastResponse, router, queryClient]);

    return null;
}
