import { View } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";

/**
 * Den tomme tilstanden gruppesidens tre lister deler.
 *
 * Samme oppsett som resten av appen bruker (bot-fanen, lovlista), men trukket ut
 * fordi tre lister på samme skjerm som ser ulike ut når de er tomme, ser ut som
 * tre feil framfor én ryddig beskjed.
 */
export function GroupEmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    const { isDarkColorScheme } = useColorScheme();

    return (
        <View className="py-16 items-center">
            <View className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-4">
                <Icon size={28} color={themeColors(isDarkColorScheme).primary} />
            </View>
            <Text className="text-lg font-semibold text-foreground mb-1">
                {title}
            </Text>
            <Text className="text-sm text-muted-foreground text-center px-8">
                {description}
            </Text>
        </View>
    );
}
