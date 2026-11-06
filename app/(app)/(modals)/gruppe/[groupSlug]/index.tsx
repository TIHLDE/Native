import { memo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GroupListItem } from "@/actions/types";
import { useLocalSearchParams } from "expo-router";
import { Image, View } from "react-native";
import { Crown, Users } from "lucide-react-native";
import { fetchMemberships } from "@/actions/fines/memberships";
import { fetchGroup } from "@/actions/groups/group";
import { fetchGroupMembers } from "@/actions/groups/members";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";
import PageWrapper from "@/components/ui/pagewrapper";
import {
    GroupFinesTab,
    useFinesTabState,
} from "@/components/grupper/GroupFinesTab";
import { GroupInfoTab } from "@/components/grupper/GroupInfoTab";
import { GroupMembersList } from "@/components/grupper/GroupMembersList";
import {
    GroupTabKey,
    finesTabsVisible,
    groupTabs,
    groupTypeLabel,
} from "@/lib/groups/groupPage";
import { avatarImageUrl } from "@/lib/images";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";

// Fanene blir stående montert etter første besøk. Uten memo ville et
// fanebytte rendret alle sammen på nytt, også de skjulte, siden sida selv
// rendres når `tab` endres.
const InfoTab = memo(GroupInfoTab);
const MembersTab = memo(GroupMembersList);
const FinesTab = memo(GroupFinesTab);

/**
 * Én gruppe: om den, hvem som er med, og — når bøter er skrudd på — bøtene.
 * Lovverket har en egen skjerm (`lovverk.tsx`), som åpnes fra Bøter-fanen.
 *
 * Hodet fylles fra `["memberships"]` eller `["groups"]` framfor å vente på
 * gruppekallet — cachen er varm fra grupper-lista brukeren nettopp sto i.
 * `GET /groups/:slug` hentes i tillegg for det bare den har: hva gruppa kaller
 * lederen sin, og om innloggeren får se bøtene (`finesTabsVisible`).
 *
 * Fanene identifiseres med nøkkel, ikke indeks, fordi settet endrer seg med
 * tilgangen til bøter. Bryteren og gruppehodet ligger fast over innholdet, ikke
 * som `ListHeaderComponent`. Ellers ville bryteren rullet vekk, og et
 * fanebytte midt i en lang liste ville hoppet.
 */
export default function GruppeSide() {
    const { groupSlug, tab: initialTab } = useLocalSearchParams<{
        groupSlug: string;
        tab?: GroupTabKey;
    }>();
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);
    // `tab` lar et varsel åpne sida rett på en fane. En ukjent verdi fanges
    // av `activeTab` under og faller tilbake til Om.
    const [tab, setTab] = useState<GroupTabKey>(initialTab ?? "info");
    const queryClient = useQueryClient();
    // Visning, filter og åpent medlem i bøtefanen. Holdt her, ved siden av
    // `tab`, så sida eier alt fanene skal huske.
    const finesState = useFinesTabState();

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
    // Bare en lesning av cachen: åpnes sida fra et varsel, skal den ikke
    // hente alle grupper for å fylle hodet.
    const listed = queryClient
        .getQueryData<GroupListItem[]>(["groups"])
        ?.find((item) => item.slug === groupSlug);
    const group = groupDetail.data ?? membership?.group ?? listed;
    const typeLabel = group ? groupTypeLabel(group.type) : "";

    const tabs = groupTabs(
        finesTabsVisible(groupDetail.data, membership?.group)
    );
    // En nøkkel som ikke finnes i settet — «Bøter» i en gruppe uten bøter —
    // faller tilbake til Om framfor å vise ingenting.
    const activeTab = tabs.some((item) => item.key === tab) ? tab : "info";

    // Fanene som er valgt minst én gang. Utledet av `activeTab` og ikke av
    // `tab`: åpnes sida fra et varsel med `tab=fines` før tilgangen er kjent,
    // vises Om først, og Bøter monteres når den faktisk dukker opp. Oppdatert
    // under rendringen, så en ny fane er montert i samme frame som den velges.
    const [mountedTabs, setMountedTabs] = useState<GroupTabKey[]>([]);
    if (!mountedTabs.includes(activeTab)) {
        setMountedTabs([...mountedTabs, activeTab]);
    }

    const leader = members.data?.find(
        (member) => member.membershipType === "LEADER"
    );
    const leaderName = leader
        ? `${leader.user.firstName} ${leader.user.lastName}`.trim()
        : null;

    return (
        <PageWrapper className="flex-1 bg-background">
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
                        {typeLabel ? (
                            <View className="self-start px-3 py-1 rounded-full bg-primary/15 dark:bg-primary/25 mt-1">
                                <Text className="text-xs font-semibold text-foreground">
                                    {typeLabel}
                                </Text>
                            </View>
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

            {/* En fane monteres første gang den velges og blir stående. Det
                holder antallet kall nede ved åpning, og en fane man kommer
                tilbake til, står der man forlot den — rullet like langt, med
                det samme åpent. `display: none` og ikke `opacity`: en skjult
                fane skal verken ta plass eller fange trykk. */}
            {tabs.map((item) =>
                mountedTabs.includes(item.key) ? (
                    <View
                        key={item.key}
                        className="flex-1"
                        style={
                            item.key === activeTab ? undefined : { display: "none" }
                        }
                    >
                        {item.key === "info" ? (
                            <InfoTab
                                groupSlug={groupSlug}
                                group={group}
                                isPending={groupDetail.isPending}
                            />
                        ) : item.key === "members" ? (
                            <MembersTab
                                groupSlug={groupSlug}
                                leaderTitle={groupDetail.data?.leaderTitle}
                            />
                        ) : (
                            <FinesTab
                                groupSlug={groupSlug}
                                state={finesState}
                            />
                        )}
                    </View>
                ) : null
            )}
        </PageWrapper>
    );
}
