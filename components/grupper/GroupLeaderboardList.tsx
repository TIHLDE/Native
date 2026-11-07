import {
    Fragment,
    ReactElement,
    ReactNode,
    useLayoutEffect,
    useRef,
} from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
    ActivityIndicator,
    FlatList,
    LayoutAnimation,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    View,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { ChevronDown, ChevronUp, Users } from "lucide-react-native";
import { fetchFineLeaderboard } from "@/actions/fines/leaderboard";
import { fetchFines } from "@/actions/fines/fines";
import { fetchFineStatistics } from "@/actions/fines/statistics";
import { FineLeaderboardEntry, FineStatus } from "@/actions/types";
import { Text } from "@/components/ui/text";
import {
    FineStatKey,
    MEMBER_PAGE_SIZE,
    MemberFinesPageParam,
    emphasizedStats,
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

/**
 * Bøtene inne i et åpent medlem: mindre kort, satt inn fra kanten av
 * medlemskortet. `bg-background` skiller dem fra kortet i lys modus, og i mørk
 * modus er de litt lysere enn det.
 */
const MEMBER_FINE_CLASS =
    "mx-2.5 mb-2 rounded-xl p-3 bg-background dark:bg-secondary/50";

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

/**
 * Ett medlem: raden, og når medlemmet er åpent, innholdet under den i samme
 * kort. Kortet bærer bakgrunnen og margen, raden har ingen av delene, så raden
 * er like høy åpen og lukket.
 */
function MemberCard({
    entry,
    rank,
    expanded,
    onPress,
    children,
}: {
    entry: FineLeaderboardEntry;
    rank: number;
    expanded: boolean;
    onPress: () => void;
    /** Innholdet i det åpne medlemmet. */
    children?: ReactNode;
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
        <View className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden">
            <Pressable
                onPress={onPress}
                disabled={isEmpty}
                accessibilityRole="button"
                accessibilityState={
                    isEmpty ? { disabled: true } : { expanded }
                }
                accessibilityLabel={`${rank}. ${entry.name}, ${amount}, ${subtitle}`}
                className="p-4 flex-row items-center active:opacity-70"
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
            {children}
        </View>
    );
}

const STAT_PARTS: { key: FineStatKey; label: string }[] = [
    { key: "notApproved", label: "ikke godkjent" },
    { key: "approvedNotPaid", label: "ubetalt" },
    { key: "paid", label: "betalt" },
];

/**
 * Summene til ett åpent medlem, øverst i kortet: «x ikke godkjent ·
 * y ubetalt · z betalt», i bøter.
 *
 * Tallene er medlemmets hele bilde og endres ikke med filteret — ellers ville
 * «betalt» falt til 0 i Aktive. Delene filteret viser, utheves.
 *
 * Skjelettet har samme høyde som linja, så kortet ikke hopper når tallene
 * kommer. En feil skjuler linja; bøtene under har sin egen query og vises
 * uansett.
 */
function MemberStatsLine({
    groupSlug,
    userId,
    status,
}: {
    groupSlug: string;
    userId: string;
    status?: FineStatus;
}) {
    const { data, isError } = useQuery({
        // Under `["fines", groupSlug]`, så dra-for-å-oppdatere treffer den.
        queryKey: ["fines", groupSlug, "statistics", { userId }],
        queryFn: () => fetchFineStatistics(groupSlug, userId),
    });

    if (isError) return null;

    if (!data) {
        return (
            <View className="mx-4 mt-3 w-48 h-[18px] rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
        );
    }

    const emphasized = emphasizedStats(status);

    return (
        <Text
            className="mx-4 mt-3 text-[13px] leading-[18px] text-muted-foreground"
            numberOfLines={1}
        >
            {STAT_PARTS.map(({ key, label }, index) => (
                <Fragment key={key}>
                    {index > 0 ? " · " : ""}
                    <Text
                        className={
                            emphasized.includes(key)
                                ? "text-[13px] leading-[18px] text-foreground font-semibold"
                                : "text-[13px] leading-[18px] text-muted-foreground"
                        }
                    >
                        {`${data[key]} ${label}`}
                    </Text>
                </Fragment>
            ))}
        </Text>
    );
}

/**
 * Bøtene til ett åpent medlem, ti om gangen.
 *
 * «Aktive bøter» er to kall etter hverandre: `pending` til den er tom, så
 * `approved`. Et kall uten status ville tatt med de betalte, som tallet i
 * raden over ikke teller.
 *
 * Det lastes aldri automatisk her inne. Uendelig rulling i et medlem ville
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
            <View className="pt-3 pb-0.5">
                <FineCardSkeleton className={MEMBER_FINE_CLASS} />
                <FineCardSkeleton className={MEMBER_FINE_CLASS} />
            </View>
        );
    }

    if (isError) {
        return (
            <Text className="mx-4 pt-3 mb-3 text-sm text-destructive text-center">
                {error.message}
            </Text>
        );
    }

    const fines = data.pages.flatMap((page) => page.results);
    const remaining = remainingFines(entry.finesCount, fines.length);

    // `pt-3` står her og ikke under summene, så det er luft under skillelinja
    // også når summene mangler. `pb-0.5` og bøtenes `mb-2` gir samme luft
    // under som på sidene.
    return (
        <View className="pt-3 pb-0.5">
            {fines.length === 0 ? (
                <Text className="mx-4 mb-3 text-sm text-muted-foreground text-center">
                    Fant ingen bøter
                </Text>
            ) : (
                fines.map((fine) => (
                    <FineCard
                        key={fine.id}
                        fine={fine}
                        hideUser
                        className={MEMBER_FINE_CLASS}
                    />
                ))
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
 * `scrollToIndex` er ikke brukt: uten `getItemLayout` regner den med
 * anslåtte høyder, og `scrollToLocation` i den gamle SectionList-en havnet
 * hundrevis av punkter feil på enhet.
 *
 * Lista er en FlatList med ett kort per medlem. Raden og innholdet i et åpent
 * medlem står i samme kort, og det går ikke når de er to celler, som
 * overskrift og innhold i en SectionList.
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
    const listRef = useRef<FlatList<FineLeaderboardEntry>>(null);

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
    const isOpen = (entry: FineLeaderboardEntry) =>
        entry.id === openUserId && entry.finesAmount > 0;

    // Hvor lista står nå. Trengs når et medlem over lukkes. `onScroll` er
    // strupet til hvert 100. ms, så slutten av et drag og av momentum leses
    // også, ellers kan verdien ligge etter der lista faktisk stoppet.
    const scrollY = useRef(0);
    const trackScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollY.current = event.nativeEvent.contentOffset.y;
    };

    // Høyden av innholdet i det åpne medlemmet, målt med `onLayout`. Trengs
    // når det lukkes fordi et medlem lenger ned åpnes. Kortets margin og
    // radens høyde er de samme åpen og lukket, så dette er nøyaktig hvor mye
    // lista krymper.
    const openBodyHeight = useRef(0);
    // Satt av trykket, brukt etter committen: hvor lista skal stå når
    // medlemmet over har lukket seg.
    const pendingOffset = useRef<number | null>(null);

    const toggle = (userId: string, index: number) => {
        const previousIndex = entries.findIndex(isOpen);
        const isOpening = openUserId !== userId;
        const closesAbove =
            isOpening && previousIndex >= 0 && previousIndex < index;

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
        listRef.current?.scrollToOffset({ offset, animated: false });
    }, [openUserId]);

    return (
        <FlatList
            ref={listRef}
            data={entries}
            className="flex-1"
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
            refreshControl={refreshControl}
            ListHeaderComponent={ListHeaderComponent}
            renderItem={({ item, index }) => {
                const expanded = isOpen(item);
                return (
                    <MemberCard
                        entry={item}
                        rank={index + 1}
                        expanded={expanded}
                        onPress={() => toggle(item.id, index)}
                    >
                        {expanded ? (
                            <View
                                onLayout={(event) => {
                                    openBodyHeight.current =
                                        event.nativeEvent.layout.height;
                                }}
                            >
                                {/* Inne i målingen, så rulle-justeringen når
                                    medlemmet lukkes tar med skillelinja og
                                    summene. */}
                                <View className="mx-4 border-t border-border" />
                                <MemberStatsLine
                                    groupSlug={groupSlug}
                                    userId={item.id}
                                    status={status}
                                />
                                <MemberFines
                                    groupSlug={groupSlug}
                                    entry={item}
                                    status={status}
                                />
                            </View>
                        ) : null}
                    </MemberCard>
                );
            }}
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
