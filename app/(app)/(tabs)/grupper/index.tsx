import { useEffect, useState } from "react";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { avatarImageUrl } from "@/lib/images";
import { themeColors } from "@/lib/theme/colors";
import { Text } from "@/components/ui/text";
import PageWrapper, { TAB_SCREEN_EDGES, TAB_BAR_CLEARANCE } from "@/components/ui/pagewrapper";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";
import { fetchMemberships } from "@/actions/fines/memberships";
import { fetchGroups } from "@/actions/groups/list";
import {
    GroupRow,
    GroupSection,
    GroupSectionKey,
    groupSections,
} from "@/lib/groups/groupPage";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Image, Pressable, SectionList, View } from "react-native";
import { ChevronRight, Users } from "lucide-react-native";

function MembershipCardSkeleton() {
    return (
        <View className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            <View className="flex-1 ml-3">
                <View className="w-32 h-4 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse mb-2" />
                <View className="w-20 h-3 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            </View>
        </View>
    );
}

function SectionHeader({
    title,
    count,
    isOpen,
    onToggle,
    chevronColor,
}: {
    title: string;
    count: number;
    isOpen: boolean;
    onToggle: () => void;
    chevronColor: string;
}) {
    const rotation = useSharedValue(isOpen ? 90 : 0);

    useEffect(() => {
        // withSpring følger ReduceMotion.System som standard: med «Reduser
        // bevegelse» på hopper den rett til målet, så det trengs ingen egen gren.
        rotation.value = withSpring(isOpen ? 90 : 0, {
            dampingRatio: 1,
            duration: 300,
        });
    }, [isOpen, rotation]);

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const countLabel = count === 1 ? "1 gruppe" : `${count} grupper`;

    return (
        <Pressable
            onPress={() => {
                void Haptics.selectionAsync();
                onToggle();
            }}
            accessibilityRole="button"
            accessibilityLabel={`${title}, ${countLabel}`}
            accessibilityState={{ expanded: isOpen }}
            className="mx-4 mt-2 py-2 flex-row items-center active:opacity-70"
        >
            <Text className="flex-1 text-lg font-bold text-foreground">
                {title}
                <Text className="text-base font-normal text-muted-foreground">
                    {`  ${count}`}
                </Text>
            </Text>
            <Animated.View style={chevronStyle}>
                <ChevronRight size={20} color={chevronColor} />
            </Animated.View>
        </Pressable>
    );
}

function ErrorLine({ message }: { message: string }) {
    return (
        <Text className="mx-4 mt-4 mb-2 text-sm text-destructive">{message}</Text>
    );
}

function rowSubtitle(row: GroupRow): string {
    const parts: string[] = [];
    if (row.role) parts.push(row.role === "LEADER" ? "Leder" : "Medlem");
    if (row.memberCount !== undefined) {
        parts.push(
            row.memberCount === 1 ? "1 medlem" : `${row.memberCount} medlemmer`
        );
    }
    // Bare for egne grupper — for alle andre ville det vært støy.
    if (row.role && !row.group.finesActivated) parts.push("Uten bøter");
    return parts.join(" · ");
}

/**
 * Alle grupper, med brukerens egne øverst og resten delt etter type i
 * seksjoner som kan foldes ut.
 *
 * Gruppesida og medlemslista er åpne for alle, så lista er ikke lenger bare
 * dine grupper. Medlemskapene styrer når lista vises, og gruppene legges til:
 * kom `["groups"]` først, ville typeseksjonene stått uten roller og «Mine
 * grupper» dyttet alt ned når den kom.
 */
export default function Grupper() {
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);
    const [expanded, setExpanded] = useState<Set<GroupSectionKey>>(
        () => new Set(["mine"])
    );

    const memberships = useQuery({
        queryKey: ["memberships"],
        queryFn: fetchMemberships,
    });
    const groups = useQuery({
        queryKey: ["groups"],
        queryFn: fetchGroups,
    });

    const refreshControl = useRefresh([["groups"], ["memberships"]]);

    const toggle = (key: GroupSectionKey) =>
        setExpanded((current) => {
            const next = new Set(current);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });

    const sections = memberships.isPending
        ? []
        : groupSections(groups.data ?? [], memberships.data ?? []);

    const listData = sections.map((section) => ({
        ...section,
        data: expanded.has(section.key) ? section.rows : [],
    }));

    const bothFailed = memberships.isError && groups.isError;

    const header =
        memberships.isError && !bothFailed ? (
            <ErrorLine message={memberships.error.message} />
        ) : undefined;

    const footer = memberships.isPending || bothFailed ? undefined : groups.isPending ? (
        <View className="mt-4">
            <MembershipCardSkeleton />
            <MembershipCardSkeleton />
        </View>
    ) : groups.isError ? (
        <ErrorLine message={groups.error.message} />
    ) : undefined;

    return (
        <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
            <SectionList<GroupRow, GroupSection>
                sections={listData}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 4, paddingBottom: TAB_BAR_CLEARANCE }}
                refreshControl={refreshControl}
                keyExtractor={(row) => row.group.slug}
                ListHeaderComponent={header}
                ListFooterComponent={footer}
                renderSectionHeader={({ section }) => (
                    <SectionHeader
                        title={section.title}
                        // rows, ikke data: data er [] når seksjonen er lukket.
                        count={section.rows.length}
                        isOpen={expanded.has(section.key)}
                        onToggle={() => toggle(section.key)}
                        chevronColor={colors.mutedForeground}
                    />
                )}
                renderItem={({ item: row }) => (
                    <Pressable
                        onPress={() =>
                            router.push({
                                pathname: "/(app)/(modals)/gruppe/[groupSlug]",
                                params: { groupSlug: row.group.slug },
                            })
                        }
                        className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center active:opacity-70"
                    >
                        {row.group.image ? (
                            <Image
                                source={{ uri: avatarImageUrl(row.group.image) }}
                                className="w-12 h-12 rounded-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-12 h-12 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center">
                                <Users size={20} color={colors.primary} />
                            </View>
                        )}
                        <View className="flex-1 ml-3">
                            <Text className="text-base font-semibold text-foreground">
                                {row.group.name}
                            </Text>
                            {rowSubtitle(row) ? (
                                <Text className="text-sm text-muted-foreground mt-0.5">
                                    {rowSubtitle(row)}
                                </Text>
                            ) : null}
                        </View>
                        <ChevronRight size={20} color={colors.mutedForeground} />
                    </Pressable>
                )}
                ListEmptyComponent={
                    memberships.isPending ? (
                        <View className="pt-3">
                            <MembershipCardSkeleton />
                            <MembershipCardSkeleton />
                            <MembershipCardSkeleton />
                        </View>
                    ) : bothFailed ? (
                        <View className="flex-1 items-center justify-center px-6 pt-16">
                            <Text className="text-base text-destructive">
                                {groups.error.message}
                            </Text>
                        </View>
                    ) : groups.isPending || header || footer ? undefined : (
                        <View className="py-16 items-center">
                            <View className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-4">
                                <Users size={28} color={colors.primary} />
                            </View>
                            <Text className="text-lg font-semibold text-foreground mb-1">
                                Ingen grupper
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center px-8">
                                Fant ingen grupper.
                            </Text>
                        </View>
                    )
                }
            />
        </PageWrapper>
    );
}
