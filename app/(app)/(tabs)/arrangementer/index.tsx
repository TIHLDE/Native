import EventCard, { EventCardSkeleton } from "@/components/arrangement/eventCard";
import { Text } from "@/components/ui/text";
import { router, Stack } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, TextInput, View } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import PageWrapper from "@/components/ui/pagewrapper";
import { BASE_URL } from "@/actions/constant";
import useRefresh from "@/lib/useRefresh";
import useDebounce from "@/lib/useDebounce";
import { getToken } from "@/lib/storage/tokenStore";
import { useColorScheme } from "@/lib/useColorScheme";
import { CalendarDays, Search, SlidersHorizontal, X, FilterX } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { InteropBottomSheetModal } from "@/lib/interopBottomSheet";

type Event = {
    organizer: { slug: string | null; name: string; };
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    location?: string;
    image?: string;
};

type Filters = {
    expired: boolean;
    openForSignUp: boolean;
    userFavorite: boolean;
};

const DEFAULT_FILTERS: Filters = {
    expired: false,
    openForSignUp: false,
    userFavorite: false,
};

function getActiveFilterCount(filters: Filters): number {
    let count = 0;
    if (filters.expired) count++;
    if (filters.openForSignUp) count++;
    if (filters.userFavorite) count++;
    return count;
}

export default function Arrangementer() {
    const resultsPerPage = 10;
    const { isDarkColorScheme } = useColorScheme();
    const filterSheetRef = useRef<BottomSheetModal>(null);

    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [searchText, setSearchText] = useState('');
    const debouncedSearch = useDebounce(searchText, 500);

    const activeFilterCount = getActiveFilterCount(filters);

    const fetchEvents = useCallback(async ({ pageParam }: { pageParam: number }): Promise<{ results: Event[] }> => {
        const queryParams = new URLSearchParams({
            page: pageParam.toString(),
            None: resultsPerPage.toString(),
        });

        if (debouncedSearch) queryParams.set('search', debouncedSearch);
        if (filters.expired) queryParams.set('expired', 'true');
        if (filters.openForSignUp) queryParams.set('open_for_sign_up', 'true');
        if (filters.userFavorite) queryParams.set('user_favorite', 'true');

        const token = await getToken();
        const res = await fetch(`${BASE_URL}/events/?${queryParams}`, {
            headers: token ? { "X-Csrf-Token": token } : {},
        });
        return res.json();
    }, [debouncedSearch, filters]);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isPending,
        isFetchingNextPage,
        isError,
        isFetching,
    } = useInfiniteQuery({
        queryKey: ["events", debouncedSearch, filters.expired, filters.openForSignUp, filters.userFavorite],
        queryFn: fetchEvents,
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (!lastPage.results || lastPage.results?.length === 0) {
                return undefined;
            }
            return lastPageParam + 1;
        },
    });

    const refreshControl = useRefresh(["events", debouncedSearch, filters.expired, filters.openForSignUp, filters.userFavorite]);

    const allEvents = data?.pages.flatMap((page) => {
        if (!page.results) return [];
        return page.results;
    }) ?? [];

    const mutedColor = isDarkColorScheme ? '#9ca3af' : '#6b7280';

    const handleApplyFilters = () => {
        filterSheetRef.current?.dismiss();
    };

    const handleResetFilters = () => {
        setFilters(DEFAULT_FILTERS);
        setSearchText('');
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Screen
                options={{
                    headerLeft: () => (
                        <Pressable
                            onPress={() => filterSheetRef.current?.present()}
                            className="w-10 h-10 items-center justify-center"
                        >
                            <View>
                                <SlidersHorizontal size={20} color={isDarkColorScheme ? '#ffffff' : '#000000'} />
                                {activeFilterCount > 0 && (
                                    <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary items-center justify-center">
                                        <Text className="text-[10px] font-bold text-white">{activeFilterCount}</Text>
                                    </View>
                                )}
                            </View>
                        </Pressable>
                    ),
                }}
            />
            <PageWrapper className="flex-1 bg-background">
                <FlatList
                    data={allEvents}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyboardDismissMode="on-drag"
                    ListHeaderComponent={
                        <View>
                            {/* Search bar */}
                            <View className="px-4 pt-3 pb-2">
                                <View className="flex-row items-center bg-gray-100 dark:bg-secondary/30 rounded-2xl px-4 h-12">
                                    <Search size={18} color={mutedColor} />
                                    <TextInput
                                        className="flex-1 ml-3 text-foreground"
                                        placeholder="Søk etter arrangementer..."
                                        placeholderTextColor={mutedColor}
                                        value={searchText}
                                        onChangeText={setSearchText}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        style={{ fontFamily: "Inter", fontSize: 16, lineHeight: 20, paddingTop: 0, paddingBottom: 0 }}
                                    />
                                    {searchText.length > 0 && (
                                        <Pressable onPress={() => setSearchText('')} className="p-1">
                                            <X size={16} color={mutedColor} />
                                        </Pressable>
                                    )}
                                    {isFetching && !isPending && (
                                        <ActivityIndicator size="small" className="ml-2" />
                                    )}
                                </View>
                            </View>

                            {/* Active filter chips */}
                            {(activeFilterCount > 0 || debouncedSearch) && (
                                <View className="px-4 pb-2 flex-row flex-wrap gap-2">
                                    {debouncedSearch ? (
                                        <Pressable
                                            onPress={() => setSearchText('')}
                                            className="flex-row items-center bg-primary/10 dark:bg-primary/20 rounded-full px-3 py-1.5"
                                        >
                                            <Text className="text-xs font-semibold text-primary dark:text-accent mr-1.5" style={{ fontFamily: "Inter" }}>
                                                &ldquo;{debouncedSearch}&rdquo;
                                            </Text>
                                            <X size={12} color={isDarkColorScheme ? '#8ba3d4' : '#2d5dab'} />
                                        </Pressable>
                                    ) : null}
                                    {filters.expired && (
                                        <Pressable
                                            onPress={() => setFilters(f => ({ ...f, expired: false }))}
                                            className="flex-row items-center bg-primary/10 dark:bg-primary/20 rounded-full px-3 py-1.5"
                                        >
                                            <Text className="text-xs font-semibold text-primary dark:text-accent mr-1.5" style={{ fontFamily: "Inter" }}>
                                                Tidligere
                                            </Text>
                                            <X size={12} color={isDarkColorScheme ? '#8ba3d4' : '#2d5dab'} />
                                        </Pressable>
                                    )}
                                    {filters.openForSignUp && (
                                        <Pressable
                                            onPress={() => setFilters(f => ({ ...f, openForSignUp: false }))}
                                            className="flex-row items-center bg-primary/10 dark:bg-primary/20 rounded-full px-3 py-1.5"
                                        >
                                            <Text className="text-xs font-semibold text-primary dark:text-accent mr-1.5" style={{ fontFamily: "Inter" }}>
                                                Åpen påmelding
                                            </Text>
                                            <X size={12} color={isDarkColorScheme ? '#8ba3d4' : '#2d5dab'} />
                                        </Pressable>
                                    )}
                                    {filters.userFavorite && (
                                        <Pressable
                                            onPress={() => setFilters(f => ({ ...f, userFavorite: false }))}
                                            className="flex-row items-center bg-primary/10 dark:bg-primary/20 rounded-full px-3 py-1.5"
                                        >
                                            <Text className="text-xs font-semibold text-primary dark:text-accent mr-1.5" style={{ fontFamily: "Inter" }}>
                                                Favoritter
                                            </Text>
                                            <X size={12} color={isDarkColorScheme ? '#8ba3d4' : '#2d5dab'} />
                                        </Pressable>
                                    )}
                                </View>
                            )}
                        </View>
                    }
                    renderItem={({ item: event }) => (
                        <EventCard
                            key={event.id}
                            id={event.id}
                            title={event.title}
                            date={new Date(event.start_date)}
                            image={event.image ?? null}
                            location={event.location}
                            onPress={() => router.push(`/(modals)/arrangement/${event.id}`)}
                            organizer={event.organizer}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    refreshControl={refreshControl}
                    onEndReached={() => {
                        if (!hasNextPage) return;
                        fetchNextPage();
                    }}
                    ListEmptyComponent={
                        isPending ? (
                            <View>
                                <EventCardSkeleton />
                                <EventCardSkeleton />
                                <EventCardSkeleton />
                            </View>
                        ) : isError ? (
                            <View className="flex-1 items-center justify-center px-6 pt-16">
                                <Text className="text-base text-destructive">{error.message}</Text>
                            </View>
                        ) : (
                            <View className="py-16 items-center">
                                <View className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-4">
                                    <CalendarDays
                                        size={28}
                                        color={isDarkColorScheme ? '#8ba3d4' : '#2d5dab'}
                                    />
                                </View>
                                <Text className="text-lg font-semibold text-foreground mb-1">
                                    Ingen arrangementer
                                </Text>
                                <Text className="text-sm text-muted-foreground text-center px-8">
                                    {debouncedSearch || activeFilterCount > 0
                                        ? 'Ingen arrangementer matcher filtrene dine. Prøv å endre søket eller fjern filtre.'
                                        : 'Det er ingen kommende arrangementer akkurat nå. Sjekk igjen senere!'
                                    }
                                </Text>
                            </View>
                        )
                    }
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <View className="py-6">
                                <ActivityIndicator />
                            </View>
                        ) : null
                    }
                />

                {/* Filter drawer */}
                <InteropBottomSheetModal ref={filterSheetRef}
                    backgroundStyleClassName="bg-primary-foreground rounded-3xl"
                    enableDynamicSizing
                    backdropComponent={(props) => (
                        <BottomSheetBackdrop
                            opacity={0.5}
                            appearsOnIndex={0}
                            disappearsOnIndex={-1}
                            {...props}
                        />
                    )} >
                    <BottomSheetView className="bg-primary-foreground px-6 pb-10 pt-4">
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-5">
                            <View className="flex-row items-center">
                                <Text className="text-xl font-bold text-foreground">Filter</Text>
                                {activeFilterCount > 0 && (
                                    <View className="ml-2.5 w-6 h-6 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center">
                                        <Text className="text-xs font-bold text-primary dark:text-accent">
                                            {activeFilterCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {activeFilterCount > 0 && (
                                <Pressable onPress={handleResetFilters} className="flex-row items-center active:opacity-70">
                                    <FilterX size={16} color={mutedColor} />
                                    <Text className="text-sm text-muted-foreground ml-1.5" style={{ fontFamily: "Inter" }}>
                                        Nullstill
                                    </Text>
                                </Pressable>
                            )}
                        </View>

                        <View className="h-px bg-border dark:bg-muted mb-5" />

                        {/* Toggle filters */}
                        <Text className="text-base font-semibold text-foreground mb-3">Alternativer</Text>
                        <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden mb-6">
                            {/* Expired */}
                            <View className="flex-row items-center justify-between px-4 py-3.5">
                                <View className="flex-1 mr-3">
                                    <Text className="text-base text-foreground">Tidligere</Text>
                                    <Text className="text-xs text-muted-foreground mt-0.5">
                                        Vis tidligere arrangementer
                                    </Text>
                                </View>
                                <Switch
                                    checked={filters.expired}
                                    onCheckedChange={(checked) => setFilters(f => ({ ...f, expired: checked }))}
                                />
                            </View>
                            <View className="h-px bg-border dark:bg-muted ml-4" />

                            {/* Open for sign up */}
                            <View className="flex-row items-center justify-between px-4 py-3.5">
                                <View className="flex-1 mr-3">
                                    <Text className="text-base text-foreground">Åpen påmelding</Text>
                                    <Text className="text-xs text-muted-foreground mt-0.5">
                                        Vis kun arrangementer med åpen påmelding
                                    </Text>
                                </View>
                                <Switch
                                    checked={filters.openForSignUp}
                                    onCheckedChange={(checked) => setFilters(f => ({ ...f, openForSignUp: checked }))}
                                />
                            </View>
                            <View className="h-px bg-border dark:bg-muted ml-4" />

                            {/* Favorites */}
                            <View className="flex-row items-center justify-between px-4 py-3.5">
                                <View className="flex-1 mr-3">
                                    <Text className="text-base text-foreground">Favoritter</Text>
                                    <Text className="text-xs text-muted-foreground mt-0.5">
                                        Vis kun dine favoritter
                                    </Text>
                                </View>
                                <Switch
                                    checked={filters.userFavorite}
                                    onCheckedChange={(checked) => setFilters(f => ({ ...f, userFavorite: checked }))}
                                />
                            </View>
                        </View>

                        {/* Apply button */}
                        <Pressable
                            onPress={handleApplyFilters}
                            className="h-14 rounded-2xl bg-primary dark:bg-[#1C5ECA] flex-row items-center justify-center active:opacity-80"
                        >
                            <Search size={16} color="white" />
                            <Text className="text-white text-base font-semibold ml-2" style={{ fontFamily: "Inter" }}>
                                Søk
                            </Text>
                        </Pressable>
                    </BottomSheetView>
                </InteropBottomSheetModal>

            </PageWrapper>
        </GestureHandlerRootView>
    );
}
