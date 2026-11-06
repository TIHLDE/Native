import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react-native";
import { fetchFineStatistics } from "@/actions/fines/statistics";
import { FineStatistics } from "@/actions/types";
import { Dropdown } from "@/components/ui/dropdown";
import { Text } from "@/components/ui/text";
import {
    FineGrouping,
    FineStatusFilter,
    STATUS_OPTIONS,
    statusLabel,
} from "@/lib/groups/groupPage";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import { FineFilterSheet, FineFilterSheetRef } from "./FineFilterSheet";
import { GroupFinesList } from "./GroupFinesList";
import { GroupLeaderboardList } from "./GroupLeaderboardList";

const VIEW_OPTIONS: { value: FineGrouping; label: string }[] = [
    { value: "alle", label: "Alle bøter" },
    { value: "per-medlem", label: "Per medlem" },
];

/**
 * Summene øverst i lista, på én linje, med «Lovverk ›» til høyre.
 *
 * De gjelder hele gruppa, ikke det som er filtrert fram — ellers ville
 * «betalt» falt til 0 så snart man så på ubetalte. Tallene er bøter, ikke
 * antall hendelser.
 */
function FineStatsRow({
    groupSlug,
    statistics,
}: {
    groupSlug: string;
    statistics: { data?: FineStatistics; isError: boolean };
}) {
    return (
        <View className="flex-row items-center mx-4 mb-3">
            <View className="flex-1 mr-3">
                {statistics.data ? (
                    <Text
                        className="text-sm text-muted-foreground"
                        numberOfLines={1}
                    >
                        {`${statistics.data.notApproved} ikke godkjent · ${statistics.data.approvedNotPaid} ubetalt · ${statistics.data.paid} betalt`}
                    </Text>
                ) : statistics.isError ? null : (
                    // En feil skal ikke skyve lista ned med en melding — lista
                    // under viser sin egen, og summene kommer tilbake ved neste
                    // oppdatering. Lenka til lovverket står uansett.
                    <View className="w-48 h-4 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
                )}
            </View>
            <LawsLink groupSlug={groupSlug} />
        </View>
    );
}

/** «Lovverk ›». Åpner lovverket som egen skjerm. */
function LawsLink({ groupSlug }: { groupSlug: string }) {
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();

    return (
        <Pressable
            onPress={() =>
                router.push({
                    pathname: "/(app)/(modals)/gruppe/[groupSlug]/lovverk",
                    params: { groupSlug },
                })
            }
            accessibilityRole="link"
            className="flex-row items-center active:opacity-70"
        >
            <Text className="text-sm font-semibold text-primary">Lovverk</Text>
            <ChevronRight
                size={16}
                color={themeColors(isDarkColorScheme).primary}
            />
        </Pressable>
    );
}

/**
 * Bøtefanen: alle bøtene, eller hva hvert medlem står med.
 *
 * Verktøylinja ligger fast over lista, av samme grunn som fanene på
 * gruppesida: visningsmenyen til venstre, filteret til høyre, og en chip for
 * statusen når den er satt, så det synes uten å åpne arket. Summene ruller
 * med som listehode — de er det første man vil se, men skal ikke ta plass
 * fra lista når man blar.
 *
 * Fanen monteres bare for grupper med bøter aktivert, så kallene her trenger
 * ingen egen port mot Photons 404.
 */
export function GroupFinesTab({ groupSlug }: { groupSlug: string }) {
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);
    const filterSheetRef = useRef<FineFilterSheetRef>(null);
    const [grouping, setGrouping] = useState<FineGrouping>("alle");
    const [status, setStatus] = useState<FineStatusFilter>("alle");

    const statistics = useQuery({
        queryKey: ["fines", groupSlug, "statistics"],
        queryFn: () => fetchFineStatistics(groupSlug),
    });

    const statusFilter = status === "alle" ? undefined : status;
    const activeOption = STATUS_OPTIONS.find(
        (option) => option.value === status
    );
    const activeLabel =
        statusFilter && activeOption ? statusLabel(activeOption, grouping) : "";
    const header = (
        <FineStatsRow groupSlug={groupSlug} statistics={statistics} />
    );

    return (
        <View className="flex-1">
            <View className="flex-row items-center mx-4 pt-2">
                <Dropdown
                    options={VIEW_OPTIONS}
                    value={grouping}
                    onChange={setGrouping}
                    variant="plain"
                    align="start"
                    accessibilityLabel={`Visning: ${VIEW_OPTIONS.find((option) => option.value === grouping)?.label}`}
                />

                {statusFilter ? (
                    <Pressable
                        onPress={() => setStatus("alle")}
                        accessibilityRole="button"
                        accessibilityLabel={`Fjern filteret ${activeLabel}`}
                        style={{ flexShrink: 1 }}
                        className="flex-row items-center ml-3 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 active:opacity-70"
                    >
                        <Text
                            className="text-sm font-semibold text-primary"
                            style={{ flexShrink: 1 }}
                            numberOfLines={1}
                        >
                            {activeLabel}
                        </Text>
                        <X
                            size={14}
                            color={colors.primary}
                            style={{ marginLeft: 4 }}
                        />
                    </Pressable>
                ) : null}

                <View className="flex-1" />

                <Pressable
                    onPress={() => filterSheetRef.current?.present()}
                    accessibilityRole="button"
                    accessibilityLabel={
                        statusFilter ? "Filter, 1 aktivt" : "Filter"
                    }
                    hitSlop={8}
                    className="flex-row items-center ml-3 py-2 active:opacity-70"
                >
                    <SlidersHorizontal size={16} color={colors.foreground} />
                    <Text className="text-base font-semibold text-foreground ml-1.5">
                        Filter
                    </Text>
                    {statusFilter ? (
                        <View
                            className="w-2 h-2 rounded-full bg-primary ml-1.5"
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                        />
                    ) : null}
                </Pressable>
            </View>

            {grouping === "alle" ? (
                <GroupFinesList
                    groupSlug={groupSlug}
                    status={statusFilter}
                    ListHeaderComponent={header}
                />
            ) : (
                <GroupLeaderboardList
                    groupSlug={groupSlug}
                    status={statusFilter}
                    ListHeaderComponent={header}
                />
            )}

            <FineFilterSheet
                ref={filterSheetRef}
                status={status}
                grouping={grouping}
                statistics={statistics.data}
                onChange={setStatus}
            />
        </View>
    );
}
