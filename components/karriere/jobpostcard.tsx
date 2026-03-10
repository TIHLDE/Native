import { Image, View } from "react-native";
import { Text } from "../ui/text";
import { BriefcaseBusiness, MapPin, Building2 } from "lucide-react-native";
import ImageMissing from '../ui/imageMissing';
import { useColorScheme } from "@/lib/useColorScheme";

export interface JobPostProps {
    title: string;
    location: string;
    deadline: string;
    jobType: keyof typeof JOBTYPES;
    image: string | null;
    company: string;
}

export const JOBTYPES = {
    FULL_TIME: "Heltid",
    PART_TIME: "Deltid",
    SUMMER_JOB: "Sommerjobb",
    OTHER: "Annet"
}

function DeadlineBadge({ deadline }: { deadline: string }) {
    const date = new Date(deadline);
    const now = new Date();
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isUrgent = daysLeft <= 7 && daysLeft >= 0;
    const isPast = daysLeft < 0;

    const formatted = date.toLocaleDateString('no-NO', {
        day: 'numeric',
        month: 'short',
    });

    return (
        <View className={`px-3 py-1 rounded-full ${
            isPast
                ? 'bg-destructive/15 dark:bg-destructive/25'
                : isUrgent
                    ? 'bg-orange-100 dark:bg-orange-500/20'
                    : 'bg-primary/10 dark:bg-primary/20'
        }`}>
            <Text className={`text-xs font-semibold ${
                isPast
                    ? 'text-destructive'
                    : isUrgent
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-primary dark:text-accent'
            }`} style={{ fontFamily: "Inter" }}>
                {isPast ? 'Utløpt' : `Frist ${formatted}`}
            </Text>
        </View>
    );
}

export default function JobPostCard(props: JobPostProps) {
    const { isDarkColorScheme } = useColorScheme();
    const mutedColor = isDarkColorScheme ? '#9ca3af' : '#6b7280';

    return (
        <View className="pb-7">
            {/* Full-width image */}
            <View className="w-full aspect-[2/1] overflow-hidden">
                {props.image ? (
                    <Image
                        source={{ uri: props.image }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                ) : (
                    <ImageMissing />
                )}
            </View>

            {/* Content */}
            <View className="px-4 pt-3.5">
                {/* Header row: company + deadline */}
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1 mr-3">
                        <Building2 size={14} color={mutedColor} />
                        <Text className="text-sm text-muted-foreground ml-1.5 font-medium" numberOfLines={1}>
                            {props.company}
                        </Text>
                    </View>
                    <DeadlineBadge deadline={props.deadline} />
                </View>

                {/* Title */}
                <Text className="text-lg font-bold text-foreground mb-3" numberOfLines={2}>
                    {props.title}
                </Text>

                {/* Meta row */}
                <View className="flex-row items-center gap-4 mb-5">
                    <View className="flex-row items-center">
                        <BriefcaseBusiness size={14} color={mutedColor} />
                        <Text className="text-sm text-muted-foreground ml-1.5">
                            {JOBTYPES[props.jobType]}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <MapPin size={14} color={mutedColor} />
                        <Text className="text-sm text-muted-foreground ml-1.5" numberOfLines={1}>
                            {props.location}
                        </Text>
                    </View>
                </View>

                {/* Divider */}
                <View className="h-px bg-border dark:bg-muted" />
            </View>
        </View>
    )
}

export function JobPostCardSkeleton() {
    return (
        <View className="pb-7">
            {/* Image skeleton */}
            <View className="w-full aspect-[2/1] bg-muted dark:bg-secondary/40 animate-pulse" />

            {/* Content skeleton */}
            <View className="px-4 pt-3.5">
                {/* Header row */}
                <View className="flex-row items-center justify-between mb-2">
                    <View className="h-3.5 w-24 bg-muted dark:bg-secondary/40 rounded-md animate-pulse" />
                    <View className="h-6 w-20 bg-muted dark:bg-secondary/40 rounded-full animate-pulse" />
                </View>

                {/* Title */}
                <View className="h-5 w-3/4 bg-muted dark:bg-secondary/40 rounded-md animate-pulse mb-1.5" />
                <View className="h-5 w-1/2 bg-muted dark:bg-secondary/40 rounded-md animate-pulse mb-3" />

                {/* Meta row */}
                <View className="flex-row items-center gap-4 mb-5">
                    <View className="h-3.5 w-16 bg-muted dark:bg-secondary/40 rounded-md animate-pulse" />
                    <View className="h-3.5 w-20 bg-muted dark:bg-secondary/40 rounded-md animate-pulse" />
                </View>

                {/* Divider */}
                <View className="h-px bg-muted dark:bg-secondary/40" />
            </View>
        </View>
    )
}
