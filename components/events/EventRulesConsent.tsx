import { ActivityIndicator, Pressable, View } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { Text } from "@/components/ui/text";
import { Switch } from "@/components/ui/switch";
import { ScrollText } from "lucide-react-native";
import { EVENT_RULES_URL } from "@/lib/useEventRulesConsent";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";

type Props = {
    /** Kalles når medlemmet godtar. Én handling — det finnes ingen angre her. */
    onAccept: () => void;
    isSubmitting?: boolean;
    error?: string | null;
    /** Linja under tittelen, som avhenger av om påmeldingen har åpnet. */
    message: string;
};

/**
 * Blokkeringen medlemmer ellers møter for sent: reglene må godkjennes før
 * Photon slipper deg på et arrangement, men bryteren lå bare i
 * profilinnstillingene. Her kan de godkjenne der de står.
 *
 * Nettsiden bruker en avkryssingsboks. Appen har ingen, og profilsiden har
 * allerede en bryter for det samme valget — så den brukes her, slik at det er
 * samme kontroll begge steder.
 */
export default function EventRulesConsent({
    onAccept,
    isSubmitting,
    error,
    message,
}: Props) {
    const { isDarkColorScheme } = useColorScheme();
    const palette = themeColors(isDarkColorScheme);

    return (
        <View className="rounded-2xl bg-muted/60 dark:bg-muted/30 px-4 py-4 mb-3">
            <View className="flex-row items-center">
                <ScrollText size={18} color={palette.foreground} />
                <Text className="flex-1 text-base font-semibold text-foreground ml-2.5">
                    Du må godkjenne arrangementsreglene
                </Text>
            </View>

            <Text className="text-sm text-muted-foreground mt-2">{message}</Text>

            <View className="flex-row items-center mt-4">
                <Switch
                    checked={false}
                    disabled={isSubmitting}
                    onCheckedChange={(checked) => {
                        if (checked) onAccept();
                    }}
                    nativeID="event-rules-consent"
                />
                <Text className="flex-1 text-sm text-foreground ml-3">
                    Jeg har lest og godtar arrangementsreglene
                </Text>
                {isSubmitting ? <ActivityIndicator size="small" /> : null}
            </View>

            {error ? (
                <Text className="text-sm text-destructive mt-3">{error}</Text>
            ) : null}

            <Pressable
                onPress={() => WebBrowser.openBrowserAsync(EVENT_RULES_URL)}
                className="h-11 rounded-xl border border-border items-center justify-center mt-4 active:opacity-70"
            >
                <Text className="text-sm font-semibold text-foreground">
                    Les reglene
                </Text>
            </Pressable>
        </View>
    );
}
