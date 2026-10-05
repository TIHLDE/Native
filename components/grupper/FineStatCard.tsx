import { View } from "react-native";
import { Text } from "@/components/ui/text";

/**
 * Én sum i bøteoversikten: antall bøter på ett stadium, og snittet per medlem.
 *
 * Tallene er bøter, ikke kroner — se `FineStatistics`.
 */
export function FineStatCard({
    label,
    value,
    perMember,
}: {
    label: string;
    value: number;
    /** Ferdig formatert, f.eks. «1.8». */
    perMember: string;
}) {
    return (
        <View className="flex-1 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-3">
            <Text className="text-xs text-muted-foreground" numberOfLines={2}>
                {label}
            </Text>
            <Text className="text-2xl font-bold text-foreground mt-1">
                {value}
            </Text>
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {`${perMember} per medlem`}
            </Text>
        </View>
    );
}

export function FineStatCardSkeleton() {
    return (
        <View className="flex-1 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-3">
            <View className="w-16 h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            <View className="w-8 h-6 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mt-2" />
            <View className="w-20 h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mt-2" />
        </View>
    );
}
