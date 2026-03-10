import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { Text } from "@/components/ui/text";
import ImageMissing from '../ui/imageMissing';
import { useColorScheme } from "@/lib/useColorScheme";
import { CalendarDays, MapPin, Clock } from "lucide-react-native";

interface EventCardProps {
    id: string;
    title: string | null;
    date: Date | string | null;
    endDate?: Date | string | null;
    image: string | null;
    onPress: () => void;
    location?: string | null;
    organizer: {
        name: string;
        slug: string | null;
    };
}

function OrganizerBadge({ organizer }: { organizer: EventCardProps['organizer'] }) {
    const slug = organizer?.slug?.toLowerCase();

    const colorMap: Record<string, { bg: string; text: string }> = {
        sosialen: { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
        nok: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
        jentekom: { bg: 'bg-pink-100 dark:bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400' },
        hs: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
        kok: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
        plask: { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400' },
    };

    const colors = colorMap[slug ?? ''] ?? { bg: 'bg-primary/10 dark:bg-primary/20', text: 'text-primary dark:text-accent' };

    return (
        <View className={`px-3 py-1 rounded-full ${colors.bg}`}>
            <Text className={`text-xs font-semibold ${colors.text}`} style={{ fontFamily: "Inter" }}>
                {organizer?.name}
            </Text>
        </View>
    );
}

const EventCard = ({
    title,
    date,
    image,
    onPress,
    organizer,
    location,
}: EventCardProps) => {
    const { isDarkColorScheme } = useColorScheme();
    const mutedColor = isDarkColorScheme ? '#9ca3af' : '#6b7280';

    const dateObj = date
        ? typeof date === "string" ? new Date(date) : date
        : null;

    const formattedDate = dateObj
        ? dateObj.toLocaleDateString("no-NO", { day: 'numeric', month: 'short' })
        : "Dato";

    const formattedTime = dateObj
        ? dateObj.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })
        : "";

    return (
        <Pressable onPress={onPress} className="pb-7 active:opacity-80">
            {/* Full-width image */}
            <View className="w-full aspect-[2/1] overflow-hidden">
                {image ? (
                    <Image
                        source={{ uri: image }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                ) : (
                    <ImageMissing />
                )}
            </View>

            {/* Content */}
            <View className="px-4 pt-3.5">
                {/* Header row: organizer + date badge */}
                <View className="flex-row items-center justify-between mb-2">
                    <OrganizerBadge organizer={organizer} />
                </View>

                {/* Title */}
                <Text className="text-lg font-bold text-foreground mb-3" numberOfLines={2}>
                    {title || "Tittel"}
                </Text>

                {/* Meta row */}
                <View className="flex-row items-center gap-4 mb-5">
                    <View className="flex-row items-center">
                        <CalendarDays size={14} color={mutedColor} />
                        <Text className="text-sm text-muted-foreground ml-1.5">
                            {formattedDate}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <Clock size={14} color={mutedColor} />
                        <Text className="text-sm text-muted-foreground ml-1.5">
                            {formattedTime}
                        </Text>
                    </View>
                    {location && (
                        <View className="flex-row items-center flex-1">
                            <MapPin size={14} color={mutedColor} />
                            <Text className="text-sm text-muted-foreground ml-1.5" numberOfLines={1}>
                                {location}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Divider */}
                <View className="h-px bg-border dark:bg-muted" />
            </View>
        </Pressable>
    );
};

const EventCardSkeleton = () => {
    return (
        <View className="pb-7">
            {/* Image skeleton */}
            <View className="w-full aspect-[2/1] bg-muted dark:bg-secondary/40 animate-pulse" />

            {/* Content skeleton */}
            <View className="px-4 pt-3.5">
                {/* Organizer badge */}
                <View className="flex-row items-center mb-2">
                    <View className="h-6 w-20 bg-muted dark:bg-secondary/40 rounded-full animate-pulse" />
                </View>

                {/* Title */}
                <View className="h-5 w-3/4 bg-muted dark:bg-secondary/40 rounded-md animate-pulse mb-1.5" />
                <View className="h-5 w-1/2 bg-muted dark:bg-secondary/40 rounded-md animate-pulse mb-3" />

                {/* Meta row */}
                <View className="flex-row items-center gap-4 mb-5">
                    <View className="h-3.5 w-16 bg-muted dark:bg-secondary/40 rounded-md animate-pulse" />
                    <View className="h-3.5 w-14 bg-muted dark:bg-secondary/40 rounded-md animate-pulse" />
                    <View className="h-3.5 w-20 bg-muted dark:bg-secondary/40 rounded-md animate-pulse" />
                </View>

                {/* Divider */}
                <View className="h-px bg-muted dark:bg-secondary/40" />
            </View>
        </View>
    );
};

export { EventCardSkeleton };
export default EventCard;
