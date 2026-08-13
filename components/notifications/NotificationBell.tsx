import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { fetchUnreadNotificationCount } from "@/actions/notifications/notifications";
import { notificationKeys } from "@/lib/notifications/queries";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";

/**
 * Bjella i headeren. Ligger øverst til høyre på alle fanene og åpner
 * varsellista.
 *
 * Prikken viser bare *at* det finnes uleste, ikke hvor mange — antallet er
 * ikke noe brukeren kan gjøre noe med, og et tall som står og teller opp gjør
 * headeren urolig.
 */
export function NotificationBell() {
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();

    const unread = useQuery({
        queryKey: notificationKeys.unreadCount,
        queryFn: fetchUnreadNotificationCount,
        // Bjella står montert så lenge fanen lever, så uten dette ville
        // antallet vært fra første gang skjermen ble åpnet. Varsellista
        // oppdaterer tallet selv når den markerer noe som lest.
        staleTime: 60_000,
        refetchOnMount: "always",
    });

    const hasUnread = (unread.data ?? 0) > 0;
    const colors = themeColors(isDarkColorScheme);

    return (
        <Pressable
            onPress={() => router.push("/(app)/(modals)/varsler")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hasUnread ? "Varsler, uleste" : "Varsler"}
            className="w-10 h-10 items-center justify-center"
        >
            {({ pressed }) => (
                <View style={{ opacity: pressed ? 0.7 : 1 }}>
                    <Bell size={22} strokeWidth={2} color={colors.foreground} />
                    {hasUnread ? (
                        <View
                            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary"
                            style={{
                                // Kanten skiller prikken fra bjelleikonet den
                                // ligger oppå. Den må ha headerens farge, og
                                // den er ikke en klasse her.
                                borderWidth: 1.5,
                                borderColor: colors.background,
                            }}
                        />
                    ) : null}
                </View>
            )}
        </Pressable>
    );
}
