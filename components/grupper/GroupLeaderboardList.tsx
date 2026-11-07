import { ReactElement, useLayoutEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
    ActivityIndicator,
    LayoutAnimation,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    SectionList,
    View,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { ChevronDown, ChevronUp, Users } from "lucide-react-native";
import { fetchFineLeaderboard } from "@/actions/fines/leaderboard";
import { fetchFines } from "@/actions/fines/fines";
import { FineLeaderboardEntry, FineStatus } from "@/actions/types";
import { Text } from "@/components/ui/text";
import {
    MEMBER_PAGE_SIZE,
    MemberFinesPageParam,
    memberFinesInitialParam,
    memberFinesNextParam,
    remainingFines,
} from "@/lib/groups/groupPage";
import { themeColors } from "@/lib/theme/colors";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";
import { FineCard, FineCardSkeleton } from "./GroupFinesList";
import { GroupEmptyState } from "./GroupEmptyState";
import { PersonAvatar } from "./PersonAvatar";

type MemberSection = {
    entry: FineLeaderboardEntry;
    rank: number;
    /** `[entry]` når medlemmet er åpent, ellers tom. */
    data: FineLeaderboardEntry[];
};

function LeaderboardRowSkeleton() {
    return (
        <View className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center">
            <View className="w-6 h-4 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-secondary/50 animate-pulse ml-3" />
            <View className="flex-1 ml-3">
                <View className="w-28 h-4 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            </View>
        </View>
    );
}

/** Medlemsraden, som er seksjonsoverskriften. */
function MemberHeader({
    entry,
    rank,
    expanded,
    onPress,
}: {
    entry: FineLeaderboardEntry;
    rank: number;
    expanded: boolean;
    onPress: () => void;
}) {
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);
    const isEmpty = entry.finesAmount === 0;
    const Chevron = expanded ? ChevronUp : ChevronDown;

    const amount = `${entry.finesAmount} ${entry.finesAmount === 1 ? "bot" : "bøter"}`;
    const subtitle = isEmpty
        ? "Ingen bøter"
        : `fordelt på ${entry.finesCount} ${entry.finesCount === 1 ? "hendelse" : "hendelser"}`;

    return (
        <View className="bg-background px-4 pb-3">
            <Pressable
                onPress={onPress}
                disabled={isEmpty}
                accessibilityRole="button"
                accessibilityState={
                    isEmpty ? { disabled: true } : { expanded }
                }
                accessibilityLabel={`${rank}. ${entry.name}, ${amount}, ${subtitle}`}
                className="bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center active:opacity-70"
            >
                {/* Photon sorterer høyest først, så plasseringen er
                    listeindeksen — den regnes ikke ut på nytt her. */}
                <Text className="w-6 text-base font-bold text-muted-foreground">
                    {rank}
                </Text>
                <PersonAvatar
                    name={entry.name}
                    image={entry.image}
                    className="ml-3"
                />
                <View className="flex-1 ml-3">
                    <Text
                        className="text-base font-semibold text-foreground"
                        numberOfLines={1}
                    >
                        {entry.name}
                    </Text>
                    <Text
                        className="text-sm text-muted-foreground mt-0.5"
                        numberOfLines={1}
                    >
                        {subtitle}
                    </Text>
                </View>
                <Text
                    className={
                        isEmpty
                            ? "text-base font-semibold text-muted-foreground ml-2"
                            : "text-base font-semibold text-foreground ml-2"
                    }
                >
                    {amount}
                </Text>
                {isEmpty ? null : (
                    <Chevron
                        size={18}
                        color={colors.mutedForeground}
                        style={{ marginLeft: 8 }}
                    />
                )}
            </Pressable>
        </View>
    );
}

/**
 * Bøtene til ett åpent medlem, ti om gangen.
 *
 * «Aktive bøter» er to kall etter hverandre: `pending` til den er tom, så
 * `approved`. Et kall uten status ville tatt med de betalte, som tallet i
 * raden over ikke teller.
 *
 * Det lastes aldri automatisk her inne. Uendelig rulling i en seksjon ville
 * skjøvet de neste medlemmene ned hver gang man nærmet seg dem, så man kom
 * seg aldri forbi. «Vis flere» teller hendelser, ikke bøter, og regnes av
 * `finesCount` i raden — samme tall som «fordelt på y hendelser».
 */
function MemberFines({
    groupSlug,
    entry,
    status,
}: {
    groupSlug: string;
    entry: FineLeaderboardEntry;
    status?: FineStatus;
}) {
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isPending,
        isError,
        isFetchingNextPage,
    } = useInfiniteQuery({
        // Under `["fines", groupSlug]`, så dra-for-å-oppdatere treffer den.
        // Ved oppdatering henter React Query like mange sider som er lastet,
        // så antallet som er trykket fram blir stående.
        queryKey: ["fines", groupSlug, "member", entry.id, { status }],
        queryFn: ({ pageParam }) =>
            fetchFines(groupSlug, {
                userId: entry.id,
                status: pageParam.status,
                page: pageParam.page,
                pageSize: MEMBER_PAGE_SIZE,
            }),
        initialPageParam: memberFinesInitialParam(status),
        getNextPageParam: (lastPage, _pages, lastParam: MemberFinesPageParam) =>
            memberFinesNextParam(status, lastPage, lastParam),
    });

    if (isPending) {
        return (
            <View>
                <FineCardSkeleton />
                <FineCardSkeleton />
            </View>
        );
    }

    if (isError) {
        return (
            <Text className="mx-4 mb-3 text-sm text-destructive text-center">
                {error.message}
            </Text>
        );
    }

    const fines = data.pages.flatMap((page) => page.results);
    const remaining = remainingFines(entry.finesCount, fines.length);

    return (
        <View className="pb-2">
            {fines.length === 0 ? (
                <Text className="mx-4 mb-3 text-sm text-muted-foreground text-center">
                    Fant ingen bøter
                </Text>
            ) : (
                fines.map((fine) => <FineCard key={fine.id} fine={fine} />)
            )}

            {/* Bare med noe igjen å vise: i Aktive er det en side til med
                `approved` også når medlemmet bare har ventende bøter. */}
            {hasNextPage && remaining > 0 ? (
                <Pressable
                    onPress={() => {
                        if (!isFetchingNextPage) fetchNextPage();
                    }}
                    disabled={isFetchingNextPage}
                    accessibilityRole="button"
                    accessibilityLabel={`Vis flere bøter for ${entry.name}, ${remaining} til`}
                    className="mx-4 mb-3 py-3 items-center active:opacity-70"
                >
                    {isFetchingNextPage ? (
                        <ActivityIndicator color={colors.mutedForeground} />
                    ) : (
                        <Text className="text-sm font-semibold text-primary">
                            {`Vis flere (${remaining} til)`}
                        </Text>
                    )}
                </Pressable>
            ) : null}
        </View>
    );
}

/**
 * «Per medlem» i bøtefanen: hvert medlem med summen av bøtene sine, høyest
 * først, og bøtene åpnes på stedet under raden.
 *
 * Uten `status` teller Photon bare de aktive bøtene, og et åpent medlem viser
 * da de samme — aldri de betalte som tallet i raden ikke tok med.
 *
 * Ett medlem er åpent om gangen, og et trykk på et annet bytter direkte.
 * Lista rulles ikke for å åpne et medlem: raden man trykket på står der den
 * sto, og innholdet folder seg ut under den. Bare når et medlem lenger opp
 * var åpent, flyttes lista — med nøyaktig høyden av innholdet som lukkes, så
 * raden ikke forsvinner oppover når det over den krymper.
 *
 * `scrollToLocation` er ikke brukt: uten `getItemLayout` regner den med
 * anslåtte høyder og havnet hundrevis av punkter feil på enhet.
 *
 * Hvilket medlem som er åpent, eies av bøtefanen. Et bytte av visning lukker
 * det med vilje, og fordi lista da monteres på nytt, starter «Per medlem» på
 * toppen. At gruppesida holder fanene montert gjelder bare bytte mellom
 * gruppefaner.
 */
export function GroupLeaderboardList({
    groupSlug,
    status,
    openUserId,
    onToggleMember,
    ListHeaderComponent,
}: {
    groupSlug: string;
    status?: FineStatus;
    openUserId: string | null;
    onToggleMember: (userId: string) => void;
    /** Ruller med lista, over medlemmene. Bøtefanen legger summene her. */
    ListHeaderComponent?: ReactElement;
}) {
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);
    const reduceMotion = useReducedMotion();
    const listRef = useRef<SectionList<FineLeaderboardEntry, MemberSection>>(
        null
    );

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isPending,
        isError,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["fines", groupSlug, "leaderboard", { status }],
        queryFn: ({ pageParam }) =>
            fetchFineLeaderboard(groupSlug, pageParam, status),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.next ?? undefined,
    });

    // `["fines", groupSlug]` treffer også summene over lista og bøtene i et
    // åpent medlem. Gruppa er med fordi den bærer viewerCanUseFines og
    // finesActivated, som avgjør om bøtefanen vises i det hele tatt.
    const refreshControl = useRefresh([
        ["group", groupSlug],
        ["fines", groupSlug],
    ]);
    const entries = data?.pages.flatMap((page) => page.results) ?? [];
    // Et medlem med 0 under filteret er lukket, selv om det sto åpent. Valget
    // blir stående, så det er åpent igjen når filteret settes tilbake.
    const sections: MemberSection[] = entries.map((entry, index) => ({
        entry,
        rank: index + 1,
        data: entry.id === openUserId && entry.finesAmount > 0 ? [entry] : [],
    }));

    // Hvor lista står nå. Trengs når et medlem over lukkes. `onScroll` er
    // strupet til hvert 100. ms, så slutten av et drag og av momentum leses
    // også, ellers kan verdien ligge etter der lista faktisk stoppet.
    const scrollY = useRef(0);
    const trackScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollY.current = event.nativeEvent.contentOffset.y;
    };

    // Høyden av innholdet i det åpne medlemmet, målt med `onLayout`. Trengs
    // når det lukkes fordi et medlem lenger ned åpnes.
    const openBodyHeight = useRef(0);
    // Satt av trykket, brukt etter committen: hvor lista skal stå når
    // medlemmet over har lukket seg.
    const pendingOffset = useRef<number | null>(null);

    const toggle = (userId: string, sectionIndex: number) => {
        const previousIndex = sections.findIndex(
            (section) => section.data.length > 0
        );
        const isOpening = openUserId !== userId;
        const closesAbove =
            isOpening && previousIndex >= 0 && previousIndex < sectionIndex;

        if (closesAbove) {
            // Uten animasjon: lista flyttes like langt som innholdet over
            // krymper, i samme frame, og en animert krymping ville kommet i
            // utakt med flyttingen.
            pendingOffset.current = Math.max(
                0,
                scrollY.current - openBodyHeight.current
            );
        } else if (!reduceMotion) {
            LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
            );
        }
        onToggleMember(userId);
    };

    // Før skjermen tegnes på nytt, så sammenleggingen over og flyttingen
    // kommer i samme frame.
    useLayoutEffect(() => {
        const offset = pendingOffset.current;
        if (offset === null) return;
        pendingOffset.current = null;
        listRef.current
            ?.getScrollResponder()
            ?.scrollTo({ y: offset, animated: false });
    }, [openUserId]);

    return (
        <SectionList
            ref={listRef}
            sections={sections}
            className="flex-1"
            keyExtractor={(item) => `${item.id}-fines`}
            // Av på begge plattformer (iOS har det på som standard): et åpent
            // medlem ruller bort som resten av lista.
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
            refreshControl={refreshControl}
            ListHeaderComponent={ListHeaderComponent}
            renderSectionHeader={({ section }) => (
                <MemberHeader
                    entry={section.entry}
                    rank={section.rank}
                    expanded={section.data.length > 0}
                    onPress={() => toggle(section.entry.id, section.rank - 1)}
                />
            )}
            renderItem={({ item }) => (
                <View
                    onLayout={(event) => {
                        openBodyHeight.current =
                            event.nativeEvent.layout.height;
                    }}
                >
                    <MemberFines
                        groupSlug={groupSlug}
                        entry={item}
                        status={status}
                    />
                </View>
            )}
            scrollEventThrottle={100}
            onScroll={trackScroll}
            onScrollEndDrag={trackScroll}
            onMomentumScrollEnd={trackScroll}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            ListFooterComponent={
                isFetchingNextPage ? (
                    <ActivityIndicator
                        className="my-4"
                        color={colors.mutedForeground}
                    />
                ) : undefined
            }
            ListEmptyComponent={
                isPending ? (
                    <View>
                        <LeaderboardRowSkeleton />
                        <LeaderboardRowSkeleton />
                        <LeaderboardRowSkeleton />
                    </View>
                ) : isError ? (
                    <View className="items-center px-6 pt-16">
                        <Text className="text-base text-destructive text-center">
                            {error.message}
                        </Text>
                    </View>
                ) : (
                    <GroupEmptyState
                        icon={Users}
                        title="Ingen medlemmer"
                        description="Gruppen har ingen medlemmer å vise bøter for."
                    />
                )
            }
        />
    );
}
