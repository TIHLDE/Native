import { themeColors } from "@/lib/theme/colors";
import { JOBTYPES } from "@/components/karriere/jobpostcard";
import { classRangeLabel } from "@/actions/photon";
import { Text } from "@/components/ui/text";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import CoverImage, { COVER_IMAGE_FRAME } from "@/components/ui/coverImage";
import * as WebBrowser from 'expo-web-browser';
import MarkdownView from "@/components/ui/MarkdownView";
import PageWrapper, { TAB_SCREEN_EDGES } from "@/components/ui/pagewrapper";
import { fetchJobPost } from "@/actions/events/events";
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

// Ett felt i detaljkortet. Med grow={false} tar feltet bare plassen innholdet
// trenger og krymper aldri, slik at nabofeltet i samme rad får resten.
function DetailItem({
    icon,
    label,
    value,
    grow = true,
    lines = 1,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    grow?: boolean;
    lines?: number;
}) {
    return (
        <View className={grow ? "flex-1 flex-row items-center" : "shrink-0 flex-row items-center"}>
            {icon}
            <View className={grow ? "ml-3 flex-1" : "ml-3"}>
                <Text className="text-xs text-muted-foreground mb-0.5" style={{ fontFamily: "Inter" }}>
                    {label}
                </Text>
                <Text className="text-base text-foreground" numberOfLines={lines}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

function DetailRow({
    children,
    isLast = false,
}: {
    children: React.ReactNode;
    isLast?: boolean;
}) {
    return (
        <>
            <View className="flex-row items-center px-4 py-3.5 gap-4">
                {children}
            </View>
            {!isLast && <View className="h-px bg-border dark:bg-muted ml-12" />}
        </>
    );
}

function SkeletonItem() {
    return (
        <View className="flex-1 flex-row items-center">
            <View className="w-[18px] h-[18px] bg-muted dark:bg-secondary/50 rounded animate-pulse" />
            <View className="ml-3">
                <View className="h-3 w-16 bg-muted dark:bg-secondary/50 rounded animate-pulse mb-1.5" />
                <View className="h-4 w-24 bg-muted dark:bg-secondary/50 rounded animate-pulse" />
            </View>
        </View>
    );
}

function DetailSkeleton() {
    return (
        <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image skeleton */}
                <View className={`${COVER_IMAGE_FRAME} bg-muted dark:bg-secondary/40 animate-pulse`} />

                <View className="px-6 pt-5">
                    {/* Title skeleton */}
                    <View className="h-7 w-3/4 bg-muted dark:bg-secondary/40 rounded-md animate-pulse mb-6" />

                    {/* Details skeleton — rad 2 er søknadsfrist og årstrinn side om side */}
                    <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden mb-6">
                        {[1, 2, 3, 4].map((i) => (
                            <View key={i}>
                                <View className="flex-row items-center px-4 py-3.5 gap-4">
                                    <SkeletonItem />
                                    {i === 2 && <SkeletonItem />}
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
            return fetchJobPost(String(id));
        },
    });

    const refreshControl = useRefresh(["jobpost", id as string]);
    const mutedColor = themeColors(isDarkColorScheme).mutedForeground;

    if (jobpost.isPending) return (
        <>
            <Stack.Screen options={{ title: "" }} />
            <DetailSkeleton />
        </>
    );

    if (jobpost.isError) return (
        <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
            <Stack.Screen options={{ title: "" }} />
            <View className="flex-1 items-center justify-center px-6">
                <Text className="text-base text-destructive">{jobpost.error.message}</Text>
            </View>
        </PageWrapper>
    );

    const handleApply = async () => {
        // Photon lar lenke og frist være tomme; Lepton fylte dem alltid.
        if (jobpost.data.link) await WebBrowser.openBrowserAsync(jobpost.data.link);
    }

    const classLabel = classRangeLabel(
        String(jobpost.data.class_start ?? ""),
        String(jobpost.data.class_end ?? ""),
    );

    // Photon lar fristen være tom, og new Date(null) er 1970 — ikke en ugyldig dato.
    const parsedDeadline = jobpost.data.deadline ? new Date(jobpost.data.deadline) : null;
    const deadline = parsedDeadline && !isNaN(parsedDeadline.getTime()) ? parsedDeadline : null;

    // Når fristen deler rad med årstrinn må den være kort: forkortet måned, og
    // uten årstall når fristen er i år.
    const sharedRow = deadline !== null && classLabel !== "";
    const deadlineLabel = deadline === null
        ? null
        : deadline.toLocaleDateString("no-NO", sharedRow
            ? {
                day: "numeric",
                month: "short",
                ...(deadline.getFullYear() === new Date().getFullYear() ? {} : { year: "numeric" as const }),
            }
            : { year: "numeric", month: "long", day: "numeric" });

    return (
        <>
            <Stack.Screen options={{ title: jobpost.data.company }} />
            <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
                <ScrollView
                    refreshControl={refreshControl}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Hero image */}
                    {jobpost.data.image && (
                        <CoverImage uri={jobpost.data.image} />
                    )}

                    <View className="px-6">
                        {/* Title section */}
                        <View className="pt-5 pb-1 mb-4">
                            <Text className="text-2xl font-bold text-foreground">
                                {jobpost.data.title}
                            </Text>
                        </View>

                        {/* Details card — profile page style */}
                        <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden mb-6">
                            <DetailRow>
                                <DetailItem
                                    icon={<Building2 size={18} color={mutedColor} />}
                                    label="Bedrift"
                                    value={jobpost.data.company}
                                />
                            </DetailRow>
                            {(deadlineLabel !== null || classLabel !== "") && (
                                <DetailRow>
                                    {deadlineLabel !== null && (
                                        <DetailItem
                                            icon={<CalendarClock size={18} color={mutedColor} />}
                                            label="Søknadsfrist"
                                            value={deadlineLabel}
                                            grow={!sharedRow}
                                        />
                                    )}
                                    {classLabel !== "" && (
                                        <DetailItem
                                            icon={<GraduationCap size={18} color={mutedColor} />}
                                            label="Årstrinn"
                                            value={classLabel}
                                            lines={sharedRow ? 2 : 1}
                                        />
                                    )}
                                </DetailRow>
                            )}
                            <DetailRow>
                                <DetailItem
                                    icon={<BriefcaseBusiness size={18} color={mutedColor} />}
                                    label="Stillingstype"
                                    value={JOBTYPES[jobpost.data.job_type as keyof typeof JOBTYPES]}
                                />
                            </DetailRow>
                            <DetailRow isLast={!jobpost.data.email}>
                                <DetailItem
                                    icon={<MapPin size={18} color={mutedColor} />}
                                    label="Sted"
                                    value={jobpost.data.location}
                                />
                            </DetailRow>
                            {jobpost.data.email && (
                                <DetailRow isLast>
                                    <DetailItem
                                        icon={<Mail size={18} color={mutedColor} />}
                                        label="Kontakt"
                                        value={jobpost.data.email}
                                    />
                                </DetailRow>
                            )}
                        </View>

                        {/* Apply button — login page style */}
                        {jobpost.data.link && (
                            <Pressable
                                onPress={handleApply}
                                className="h-14 rounded-2xl bg-primary flex-row items-center justify-center mb-8 active:opacity-80"
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
