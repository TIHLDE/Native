import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pressable, View } from "react-native";
import { X } from "lucide-react-native";
import { fetchFineStatistics } from "@/actions/fines/statistics";
import { fetchGroupMembers } from "@/actions/groups/members";
import { Dropdown } from "@/components/ui/dropdown";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";
import {
    FineGrouping,
    FineStatusFilter,
    STATUS_OPTIONS,
    perMember,
    statusLabel,
} from "@/lib/groups/groupPage";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import { FineStatCard, FineStatCardSkeleton } from "./FineStatCard";
import { GroupFinesList } from "./GroupFinesList";
import { GroupLeaderboardList } from "./GroupLeaderboardList";

const GROUPINGS: { key: FineGrouping; label: string }[] = [
    { key: "alle", label: "Alle bøter" },
    { key: "per-medlem", label: "Per medlem" },
];

/**
 * Summene over lista.
 *
 * De gjelder hele gruppa, ikke det som er filtrert fram — ellers ville
 * «Betalt» falt til 0 så snart man så på ubetalte. Snittet deler på
 * medlemslista, som deler cache med medlemsfanen.
 */
function FineSummary({ groupSlug }: { groupSlug: string }) {
    const statistics = useQuery({
        queryKey: ["fines", groupSlug, "statistics"],
        queryFn: () => fetchFineStatistics(groupSlug),
    });
    const members = useQuery({
        queryKey: ["group", groupSlug, "members"],
        queryFn: () => fetchGroupMembers(groupSlug),
    });

    if (!statistics.data) {
        // En feil her skal ikke skyve lista ned med en melding — lista under
        // viser sin egen, og summene kommer tilbake ved neste oppdatering.
        if (statistics.isError) return null;
        return (
            <View className="flex-row gap-2 mx-4 mb-3">
                <FineStatCardSkeleton />
                <FineStatCardSkeleton />
                <FineStatCardSkeleton />
            </View>
        );
    }

    const memberCount = members.data?.length ?? 0;
    const { notApproved, approvedNotPaid, paid } = statistics.data;

    return (
        <View className="flex-row gap-2 mx-4 mb-3">
            <FineStatCard
                label="Ikke godkjent"
                value={notApproved}
                perMember={perMember(notApproved, memberCount)}
            />
            <FineStatCard
                label="Godkjent, ikke betalt"
                value={approvedNotPaid}
                perMember={perMember(approvedNotPaid, memberCount)}
            />
            <FineStatCard
                label="Betalt"
                value={paid}
                perMember={perMember(paid, memberCount)}
            />
        </View>
    );
}

/**
 * Bøtefanen: summene, alle bøtene og hva hvert medlem står med.
 *
 * «Per medlem» var en egen Toppliste-fane. Den er flyttet hit slik nettsida
 * har den, fordi det er samme bøter sett på to måter — og filteret skal gjelde
 * begge.
 *
 * Bryteren og filteret ligger fast over lista, av samme grunn som fanene på
 * gruppesida. Summene ruller med som listehode: de er det første man vil se,
 * men tar for mye plass til å stå fast på en telefon.
 *
 * Fanen monteres bare for grupper med bøter aktivert, så kallene her trenger
 * ingen egen port mot Photons 404.
 */
export function GroupFinesTab({ groupSlug }: { groupSlug: string }) {
    const { isDarkColorScheme } = useColorScheme();
    const [grouping, setGrouping] = useState<FineGrouping>("alle");
    const [status, setStatus] = useState<FineStatusFilter>("alle");
    const [selectedUser, setSelectedUser] = useState<
        { id: string; name: string } | undefined
    >();

    const statusFilter = status === "alle" ? undefined : status;
    const statusOptions = STATUS_OPTIONS.map((option) => ({
        value: option.value,
        label: statusLabel(option, grouping),
    }));
    const summary = <FineSummary groupSlug={groupSlug} />;

    return (
        <View className="flex-1">
            <View className="pt-3">
                <View className="flex-row items-center gap-2 mx-4">
                    <SegmentedControl
                        options={GROUPINGS.map((option) => option.label)}
                        value={GROUPINGS.findIndex(
                            (option) => option.key === grouping
                        )}
                        onChange={(index) => setGrouping(GROUPINGS[index].key)}
                        className="flex-1"
                    />
                    <Dropdown
                        options={statusOptions}
                        value={status}
                        onChange={setStatus}
                        accessibilityLabel="Filtrer på status"
                        className="max-w-[45%] self-stretch"
                    />
                </View>

                {selectedUser && grouping === "alle" ? (
                    <View className="flex-row items-center mx-4 mt-3">
                        <Text
                            className="flex-1 text-sm text-muted-foreground"
                            numberOfLines={2}
                        >
                            {/* «Per medlem» teller bare aktive bøter, men
                                «Alle bøter» uten filter viser også betalte og
                                avviste. Sier fra, så et tall fra raden ikke
                                ser ut til å stemme dårlig med lista. */}
                            {status === "alle"
                                ? `Viser alle bøter for ${selectedUser.name}, også betalte og avviste`
                                : `Viser bøter for ${selectedUser.name}`}
                        </Text>
                        <Pressable
                            onPress={() => setSelectedUser(undefined)}
                            accessibilityRole="button"
                            className="flex-row items-center ml-2 active:opacity-70"
                        >
                            <X
                                size={16}
                                color={themeColors(isDarkColorScheme).primary}
                            />
                            <Text className="text-sm font-semibold text-primary ml-1">
                                Vis alle
                            </Text>
                        </Pressable>
                    </View>
                ) : null}
            </View>

            {grouping === "alle" ? (
                <GroupFinesList
                    groupSlug={groupSlug}
                    status={statusFilter}
                    userId={selectedUser?.id}
                    ListHeaderComponent={summary}
                />
            ) : (
                <GroupLeaderboardList
                    groupSlug={groupSlug}
                    status={statusFilter}
                    onSelectUser={(user) => {
                        setSelectedUser(user);
                        setGrouping("alle");
                    }}
                    ListHeaderComponent={summary}
                />
            )}
        </View>
    );
}
