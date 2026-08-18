import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Image, View } from "react-native";
import { Users } from "lucide-react-native";
import { fetchMemberships } from "@/actions/fines/memberships";
import { fetchFineStatistics } from "@/actions/fines/statistics";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";
import PageWrapper from "@/components/ui/pagewrapper";
import { GroupFinesList } from "@/components/grupper/GroupFinesList";
import { GroupLawsList } from "@/components/grupper/GroupLawsList";
import { GroupLeaderboardList } from "@/components/grupper/GroupLeaderboardList";
import { avatarImageUrl } from "@/lib/images";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";

const TABS = ["Bøter", "Lovverk", "Toppliste"];

function StatisticTile({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-foreground">{value}</Text>
            <Text
                className="text-xs text-muted-foreground mt-0.5"
                numberOfLines={1}
            >
                {label}
            </Text>
        </View>
    );
}

/**
 * Én gruppe: bøtene som er gitt, lovverket de er gitt under, og hvem som leder.
 *
 * Gruppa leses ut av `["memberships"]` framfor et eget kall — cachen er varm
 * fra grupper-lista brukeren nettopp sto i, og medlemskapet er det eneste som
 * forteller om bøter er skrudd på.
 *
 * Bryteren og gruppehodet ligger fast over lista, ikke som `ListHeaderComponent`.
 * Ellers ville bryteren rullet vekk, og et segmentbytte midt i en lang liste
 * ville hoppet.
 */
export default function GruppeSide() {
    const { groupSlug } = useLocalSearchParams<{ groupSlug: string }>();
    const { isDarkColorScheme } = useColorScheme();
    const [tab, setTab] = useState(0);

    const memberships = useQuery({
        queryKey: ["memberships"],
        queryFn: fetchMemberships,
    });

    const membership = memberships.data?.find(
        (item) => item.group.slug === groupSlug
    );
    const group = membership?.group;
    const finesActivated = group?.fines_activated ?? false;

    const statistics = useQuery({
        queryKey: ["fines", groupSlug, "statistics"],
        queryFn: () => fetchFineStatistics(groupSlug),
        enabled: finesActivated,
    });

    return (
        <PageWrapper className="flex-1 bg-background">
            <Stack.Screen options={{ title: group?.name ?? "" }} />

            <View className="px-4 pt-2">
                <View className="flex-row items-center">
                    {group?.image ? (
                        <Image
                            source={{ uri: avatarImageUrl(group.image) }}
                            className="w-14 h-14 rounded-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-14 h-14 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center">
                            <Users
                                size={24}
                                color={themeColors(isDarkColorScheme).primary}
                            />
                        </View>
                    )}
                    <View className="flex-1 ml-3">
                        <Text className="text-xl font-bold text-foreground">
                            {group?.name ?? ""}
                        </Text>
                        {membership ? (
                            <Text className="text-sm text-muted-foreground mt-0.5">
                                {membership.membership_type === "LEADER"
                                    ? "Leder"
                                    : "Medlem"}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {finesActivated && statistics.data ? (
                    <View className="flex-row bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 mt-4">
                        <StatisticTile
                            label="Til godkjenning"
                            value={String(statistics.data.notApproved)}
                        />
                        <StatisticTile
                            label="Ubetalt"
                            value={String(statistics.data.approvedNotPaid)}
                        />
                        <StatisticTile
                            label="Betalt"
                            value={String(statistics.data.paid)}
                        />
                    </View>
                ) : null}

                <SegmentedControl
                    options={TABS}
                    value={tab}
                    onChange={setTab}
                    className="mt-4"
                />
            </View>

            {/* Bare den valgte lista er montert. Det holder antallet kall nede
                ved åpning, og hvert segment starter på topp. */}
            {tab === 0 ? (
                <GroupFinesList
                    groupSlug={groupSlug}
                    finesActivated={finesActivated}
                />
            ) : tab === 1 ? (
                <GroupLawsList groupSlug={groupSlug} />
            ) : (
                <GroupLeaderboardList
                    groupSlug={groupSlug}
                    finesActivated={finesActivated}
                />
            )}
        </PageWrapper>
    );
}
