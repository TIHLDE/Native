import { JOBTYPES } from "@/components/karriere/jobpostcard";
import { Text } from "@/components/ui/text";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Image, Pressable, ScrollView, View } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import MarkdownView from "@/components/ui/MarkdownView";
import PageWrapper from "@/components/ui/pagewrapper";
import { BASE_URL } from "@/actions/constant";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";
import {
    Building2,
    CalendarClock,
    GraduationCap,
    BriefcaseBusiness,
    MapPin,
    Mail,
    ExternalLink,
} from "lucide-react-native";
import { SectionHeader } from "@/components/ui/section-header";

function DetailRow({
    icon,
    label,
    value,
    isLast = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    isLast?: boolean;
}) {
    return (
        <>
            <View className="flex-row items-center px-4 py-3.5">
                {icon}
                <View className="ml-3 flex-1">
                    <Text className="text-xs text-muted-foreground mb-0.5" style={{ fontFamily: "Inter" }}>
                        {label}
                    </Text>
                    <Text className="text-base text-foreground" numberOfLines={1}>
                        {value}
                    </Text>
                </View>
            </View>
            {!isLast && <View className="h-px bg-border dark:bg-muted ml-12" />}
        </>
    );
}

function DetailSkeleton() {
    return (
        <PageWrapper className="flex-1 bg-background">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image skeleton */}
                <View className="w-full aspect-[16/9] bg-muted dark:bg-secondary/40 animate-pulse" />

                <View className="px-6 pt-5">
                    {/* Title skeleton */}
                    <View className="h-7 w-3/4 bg-muted dark:bg-secondary/40 rounded-md animate-pulse mb-2" />
                    <View className="h-4 w-1/3 bg-muted dark:bg-secondary/40 rounded-md animate-pulse mb-6" />

                    {/* Details skeleton */}
                    <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden mb-6">
                        {[1, 2, 3, 4].map((i) => (
                            <View key={i}>
                                <View className="flex-row items-center px-4 py-3.5">
                                    <View className="w-[18px] h-[18px] bg-muted dark:bg-secondary/50 rounded animate-pulse" />
                                    <View className="ml-3">
                                        <View className="h-3 w-16 bg-muted dark:bg-secondary/50 rounded animate-pulse mb-1.5" />
                                        <View className="h-4 w-32 bg-muted dark:bg-secondary/50 rounded animate-pulse" />
                                    </View>
                                </View>
                                {i < 4 && <View className="h-px bg-border dark:bg-muted ml-12" />}
                            </View>
                        ))}
                    </View>

                    {/* Button skeleton */}
                    <View className="h-14 bg-muted dark:bg-secondary/40 rounded-2xl animate-pulse mb-6" />

                    {/* Content skeleton */}
                    <View className="gap-2">
                        <View className="h-4 w-full bg-muted dark:bg-secondary/40 rounded animate-pulse" />
                        <View className="h-4 w-5/6 bg-muted dark:bg-secondary/40 rounded animate-pulse" />
                        <View className="h-4 w-4/6 bg-muted dark:bg-secondary/40 rounded animate-pulse" />
                    </View>
                </View>
            </ScrollView>
        </PageWrapper>
    );
}

export default function Karriereside() {
    const params = useLocalSearchParams();
    const id = params.karriereId;
    const { isDarkColorScheme } = useColorScheme();

    const jobpost = useQuery({
        queryKey: ["jobpost", id],
        queryFn: async () => {
            return fetch(`${BASE_URL}/jobposts/${id}`).then((res) => res.json());
        },
    });

    const refreshControl = useRefresh(["jobpost", id as string]);
    const mutedColor = isDarkColorScheme ? '#9ca3af' : '#6b7280';

    if (jobpost.isPending) return (
        <>
            <Stack.Screen options={{ title: "" }} />
            <DetailSkeleton />
        </>
    );

    if (jobpost.isError) return (
        <PageWrapper className="flex-1 bg-background">
            <Stack.Screen options={{ title: "" }} />
            <View className="flex-1 items-center justify-center px-6">
                <Text className="text-base text-destructive">{jobpost.error.message}</Text>
            </View>
        </PageWrapper>
    );

    const handleApply = async () => {
        await WebBrowser.openBrowserAsync(jobpost.data.link);
    }

    const formattedDeadline = new Date(jobpost.data.deadline).toLocaleDateString("no-NO", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <>
            <Stack.Screen options={{ title: jobpost.data.company }} />
            <PageWrapper className="flex-1 bg-background">
                <ScrollView
                    refreshControl={refreshControl}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Hero image */}
                    {jobpost.data.image && (
                        <View className="w-full aspect-[16/9] overflow-hidden">
                            <Image
                                className="w-full h-full"
                                resizeMode="cover"
                                source={{ uri: jobpost.data.image }}
                            />
                        </View>
                    )}

                    <View className="px-6">
                        {/* Title section */}
                        <View className="pt-5 pb-1 mb-4">
                            <Text className="text-2xl font-bold text-foreground mb-1">
                                {jobpost.data.title}
                            </Text>
                            <Text className="text-base text-muted-foreground">
                                {jobpost.data.company}
                            </Text>
                        </View>

                        {/* Details card — profile page style */}
                        <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden mb-6">
                            <DetailRow
                                icon={<Building2 size={18} color={mutedColor} />}
                                label="Bedrift"
                                value={jobpost.data.company}
                            />
                            <DetailRow
                                icon={<CalendarClock size={18} color={mutedColor} />}
                                label="Søknadsfrist"
                                value={formattedDeadline}
                            />
                            {jobpost.data.class_start && jobpost.data.class_end && (
                                <DetailRow
                                    icon={<GraduationCap size={18} color={mutedColor} />}
                                    label="Årstrinn"
                                    value={`${jobpost.data.class_start}. - ${jobpost.data.class_end}. trinn`}
                                />
                            )}
                            <DetailRow
                                icon={<BriefcaseBusiness size={18} color={mutedColor} />}
                                label="Stillingstype"
                                value={JOBTYPES[jobpost.data.job_type as keyof typeof JOBTYPES]}
                            />
                            <DetailRow
                                icon={<MapPin size={18} color={mutedColor} />}
                                label="Sted"
                                value={jobpost.data.location}
                            />
                            {jobpost.data.email && (
                                <DetailRow
                                    icon={<Mail size={18} color={mutedColor} />}
                                    label="Kontakt"
                                    value={jobpost.data.email}
                                    isLast
                                />
                            )}
                        </View>

                        {/* Apply button — login page style */}
                        {jobpost.data.link && (
                            <Pressable
                                onPress={handleApply}
                                className="h-14 rounded-2xl bg-primary dark:bg-[#1C5ECA] flex-row items-center justify-center mb-8 active:opacity-80"
                            >
                                <Text
                                    className="text-white text-base font-semibold mr-2"
                                    style={{ fontFamily: "Inter" }}
                                >
                                    Søk nå
                                </Text>
                                <ExternalLink size={16} color="white" />
                            </Pressable>
                        )}

                        {/* Description */}
                        {jobpost.data.body && (
                            <View className="mb-4">
                                <SectionHeader title="Om stillingen" className="mb-4" />
                                <MarkdownView content={jobpost.data.body} />
                            </View>
                        )}
                    </View>
                </ScrollView>
            </PageWrapper>
        </>
    );
}
