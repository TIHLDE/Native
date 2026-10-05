import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { Image, View } from "react-native";
import { Crown, Users } from "lucide-react-native";
import { fetchMemberships } from "@/actions/fines/memberships";
import { fetchGroup } from "@/actions/groups/group";
import { fetchGroupMembers } from "@/actions/groups/members";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";
import PageWrapper from "@/components/ui/pagewrapper";
import { GroupFinesTab } from "@/components/grupper/GroupFinesTab";
import { GroupInfoTab } from "@/components/grupper/GroupInfoTab";
import { GroupLawsList } from "@/components/grupper/GroupLawsList";
import { GroupMembersList } from "@/components/grupper/GroupMembersList";
import { GroupTabKey, groupTabs } from "@/lib/groups/groupPage";
import { avatarImageUrl } from "@/lib/images";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";

/**
 * Én gruppe: om den, hvem som er med, og — når bøter er skrudd på — bøtene og
 * lovverket de er gitt under.
 *
 * Medlemskapet leses ut av `["memberships"]` framfor å vente på gruppekallet —
 * cachen er varm fra grupper-lista brukeren nettopp sto i, så fanene og hodet
 * står klare med en gang. `GET /groups/:slug` hentes i tillegg for det bare
 * den har: hva gruppa kaller lederen sin.
 *
 * Fanene identifiseres med nøkkel, ikke indeks, fordi settet endrer seg med
 * `finesActivated`. Bryteren og gruppehodet ligger fast over innholdet, ikke
 * som `ListHeaderComponent`. Ellers ville bryteren rullet vekk, og et
 * fanebytte midt i en lang liste ville hoppet.
 */
export default function GruppeSide() {
    const { groupSlug } = useLocalSearchParams<{ groupSlug: string }>();
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);
    const [tab, setTab] = useState<GroupTabKey>("info");

    const memberships = useQuery({
        queryKey: ["memberships"],
        queryFn: fetchMemberships,
    });

    const groupDetail = useQuery({
        queryKey: ["group", groupSlug],
        queryFn: () => fetchGroup(groupSlug),
    });

    const members = useQuery({
        queryKey: ["group", groupSlug, "members"],
        queryFn: () => fetchGroupMembers(groupSlug),
    });

    const membership = memberships.data?.find(
        (item) => item.group.slug === groupSlug
    );
    const group = groupDetail.data ?? membership?.group;
    const finesActivated = group?.finesActivated ?? false;

    const tabs = groupTabs(finesActivated);
    // En nøkkel som ikke finnes i settet — «Bøter» i en gruppe uten bøter —
    // faller tilbake til Om framfor å vise ingenting.
    const activeTab = tabs.some((item) => item.key === tab) ? tab : "info";

    const leader = members.data?.find(
        (member) => member.membershipType === "LEADER"
    );
    const leaderName = leader
        ? `${leader.user.firstName} ${leader.user.lastName}`.trim()
        : null;

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
                            <Users size={24} color={colors.primary} />
                        </View>
                    )}
                    <View className="flex-1 ml-3">
                        <Text className="text-xl font-bold text-foreground">
                            {group?.name ?? ""}
                        </Text>
                        {membership ? (
                            <Text className="text-sm text-muted-foreground mt-0.5">
                                {membership.membershipType === "LEADER"
                                    ? "Leder"
                                    : "Medlem"}
                            </Text>
                        ) : null}
                    </View>
                </View>

                {leaderName ? (
                    <View className="self-start flex-row items-center mt-3 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-secondary/30">
                        <Crown size={14} color={colors.primary} />
                        <Text
                            className="ml-1.5 text-sm text-foreground"
                            numberOfLines={1}
                        >
                            {/* `leaderTitle` er null når gruppa bare kaller
                                det «Leder». */}
                            {`${groupDetail.data?.leaderTitle ?? "Leder"} · ${leaderName}`}
                        </Text>
                    </View>
                ) : null}

                <SegmentedControl
                    options={tabs.map((item) => item.label)}
                    value={tabs.findIndex((item) => item.key === activeTab)}
                    onChange={(index) => setTab(tabs[index].key)}
                    scrollable
                    className="mt-4"
                />
            </View>

            {/* Bare den valgte fanen er montert. Det holder antallet kall nede
                ved åpning, og hver fane starter på topp. */}
            {activeTab === "info" ? (
                <GroupInfoTab
                    groupSlug={groupSlug}
                    group={group}
                    isPending={groupDetail.isPending}
                />
            ) : activeTab === "members" ? (
                <GroupMembersList
                    groupSlug={groupSlug}
                    leaderTitle={groupDetail.data?.leaderTitle}
                />
            ) : activeTab === "fines" ? (
                <GroupFinesTab groupSlug={groupSlug} />
            ) : (
                <GroupLawsList groupSlug={groupSlug} />
            )}
        </PageWrapper>
    );
}
