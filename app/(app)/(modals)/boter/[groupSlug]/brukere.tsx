import { AuthedImage } from "@/components/ui/authedImage";
import { avatarImageUrl } from "@/lib/images";
import { themeColors } from "@/lib/theme/colors";
import { Text } from "@/components/ui/text";
import PageWrapper from "@/components/ui/pagewrapper";
import { useColorScheme } from "@/lib/useColorScheme";
import useDebounce from "@/lib/useDebounce";
import { fetchGroupUsers } from "@/actions/fines/users";
import { GroupUser } from "@/actions/types";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    TextInput,
    View,
} from "react-native";
import { Check, Search, X } from "lucide-react-native";
import Animated from "react-native-reanimated";
import {
    SelectedLawCard,
    useCollapseOnScroll,
} from "@/components/boter/SelectedLawCard";
import {
    forwardImageParams,
    ImageParams,
} from "@/components/boter/useFineImage";

function UserCardSkeleton() {
    return (
        <View className="mx-4 mb-2 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-3.5 flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            <View className="flex-1 ml-3">
                <View className="w-28 h-4 rounded bg-gray-200 dark:bg-secondary/50 animate-pulse" />
            </View>
        </View>
    );
}

export default function UserSelection() {
    const router = useRouter();
    const {
        groupSlug,
        lawId,
        lawTitle,
        lawParagraph,
        lawAmount,
        lawDescription,
        imageId,
    } = useLocalSearchParams<
        {
            groupSlug: string;
            lawId: string;
            lawTitle: string;
            lawParagraph: string;
            lawAmount: string;
            lawDescription: string;
        } & ImageParams
    >();

    const { isDarkColorScheme } = useColorScheme();
    const mutedColor = themeColors(isDarkColorScheme).mutedForeground;

    const [searchText, setSearchText] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<GroupUser[]>([]);
    const debouncedSearch = useDebounce(searchText, 500);

    // Kortet øverst klapper sammen når man blar ned i medlemslista.
    const {
        collapse: lawCardCollapse,
        onScroll,
        onCardLayout,
        spacerHeight,
    } = useCollapseOnScroll();

    const users = useQuery({
        queryKey: ["group-users", groupSlug, debouncedSearch],
        queryFn: () => fetchGroupUsers(groupSlug, debouncedSearch),
    });

    const toggleUser = (user: GroupUser) => {
        setSelectedUsers((prev) => {
            const exists = prev.find((u) => u.userId === user.userId);
            if (exists) {
                return prev.filter((u) => u.userId !== user.userId);
            }
            return [...prev, user];
        });
    };

    const isSelected = (userId: string) =>
        selectedUsers.some((u) => u.userId === userId);

    const handleNext = () => {
        router.push({
            pathname: "/(app)/(modals)/boter/[groupSlug]/bekreft",
            params: {
                groupSlug,
                lawId,
                lawTitle,
                lawParagraph,
                lawAmount,
                lawDescription,
                selectedUsers: JSON.stringify(
                    selectedUsers.map((u) => ({
                        id: u.id,
                        userId: u.userId,
                        firstName: u.firstName,
                        lastName: u.lastName,
                        image: u.image,
                    }))
                ),
                ...forwardImageParams({ imageId }),
            },
        });
    };

    return (
        <PageWrapper className="flex-1 bg-background">
            <View style={{ flex: 1 }}>
                {/* Reanimated-lista, så blaingen kan styre kortet over på UI-tråden.
                    Skjult til kortet er målt, ellers ville søkefeltet hoppet ned
                    når plassholderen øverst får høyden sin. */}
                <Animated.FlatList
                    style={{ flex: 1, opacity: spacerHeight > 0 ? 1 : 0 }}
                    data={users.data?.results ?? []}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    keyboardDismissMode="on-drag"
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    keyExtractor={(item) => item.userId}
                    ListHeaderComponent={
                        <View>
                            {/* Plass til kortet som ligger oppå lista. */}
                            <View style={{ height: spacerHeight }} />

                            {/* Search bar */}
                            <View className="px-4 pt-3 pb-3">
                                <View className="flex-row items-center bg-gray-100 dark:bg-secondary/30 rounded-2xl px-4 h-12">
                                    <Search size={18} color={mutedColor} />
                                    <TextInput
                                        className="flex-1 ml-3 text-foreground"
                                        placeholder="Søk etter brukere..."
                                        placeholderTextColor={mutedColor}
                                        value={searchText}
                                        onChangeText={setSearchText}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        inputMode="search"
                                        returnKeyType="search"
                                        style={{
                                            fontFamily: "Inter",
                                            fontSize: 16,
                                            lineHeight: 20,
                                            paddingTop: 0,
                                            paddingBottom: 0,
                                        }}
                                    />
                                    {searchText.length > 0 && (
                                        <Pressable
                                            onPress={() => setSearchText("")}
                                            className="p-1"
                                        >
                                            <X size={16} color={mutedColor} />
                                        </Pressable>
                                    )}
                                    {users.isFetching && !users.isPending && (
                                        <ActivityIndicator
                                            size="small"
                                            className="ml-2"
                                        />
                                    )}
                                </View>
                            </View>

                            {/* Selected count */}
                            {selectedUsers.length > 0 && (
                                <View className="px-4 pb-2">
                                    <Text className="text-sm text-muted-foreground">
                                        {selectedUsers.length} bruker
                                        {selectedUsers.length !== 1 ? "e" : ""} valgt
                                    </Text>
                                </View>
                            )}
                        </View>
                    }
                    renderItem={({ item: user }) => {
                        const selected = isSelected(user.userId);
                        return (
                            <Pressable
                                onPress={() => toggleUser(user)}
                                className={`mx-4 mb-2 rounded-2xl p-3.5 flex-row items-center active:opacity-70 ${
                                    selected
                                        ? "bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40"
                                        : "bg-gray-100 dark:bg-secondary/30"
                                }`}
                            >
                                {user.image ? (
                                    <AuthedImage
                                        uri={avatarImageUrl(user.image)}
                                        className="w-10 h-10 rounded-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="w-10 h-10 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center">
                                        <Text className="text-sm font-bold text-primary">
                                            {user.firstName[0]}
                                            {user.lastName[0]}
                                        </Text>
                                    </View>
                                )}
                                <Text className="flex-1 ml-3 text-base text-foreground">
                                    {user.firstName} {user.lastName}
                                </Text>
                                {selected && (
                                    <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                                        <Check size={16} color="white" />
                                    </View>
                                )}
                            </Pressable>
                        );
                    }}
                    ListEmptyComponent={
                        users.isPending ? (
                            <View>
                                <UserCardSkeleton />
                                <UserCardSkeleton />
                                <UserCardSkeleton />
                                <UserCardSkeleton />
                                <UserCardSkeleton />
                            </View>
                        ) : users.isError ? (
                            <View className="flex-1 items-center justify-center px-6 pt-16">
                                <Text className="text-base text-destructive">
                                    {users.error.message}
                                </Text>
                            </View>
                        ) : (
                            <View className="py-16 items-center">
                                <Text className="text-lg font-semibold text-foreground mb-1">
                                    Ingen brukere funnet
                                </Text>
                                <Text className="text-sm text-muted-foreground text-center px-8">
                                    Prøv å endre søket ditt.
                                </Text>
                            </View>
                        )
                    }
                />

                {/* Valgt paragraf ligger oppå lista, så man hele tiden ser hva
                    boten gis for mens man søker og ruller. Den ligger etter lista,
                    fordi Android tegner og sender trykk etter rekkefølgen og ikke
                    alltid etter zIndex. Ugjennomsiktig bakgrunn, så radene som
                    blas under ikke skinner gjennom kortet og margene. */}
                <View
                    onLayout={onCardLayout}
                    pointerEvents="box-none"
                    className="absolute top-0 left-0 right-0 bg-background pb-1"
                >
                    <SelectedLawCard
                        paragraph={lawParagraph}
                        title={lawTitle}
                        description={lawDescription}
                        amount={lawAmount}
                        onChange={() => router.back()}
                        collapse={lawCardCollapse}
                    />
                </View>
            </View>

            {/* Bottom action bar */}
            <View className="px-4 pt-3 pb-3 bg-background border-t border-border">
                <Pressable
                    onPress={handleNext}
                    disabled={selectedUsers.length === 0}
                    className={`h-14 rounded-2xl flex-row items-center justify-center ${
                        selectedUsers.length > 0
                            ? "bg-primary active:opacity-80"
                            : "bg-gray-200 dark:bg-secondary/30"
                    }`}
                >
                    <Text
                        className={`text-base font-semibold ${
                            selectedUsers.length > 0
                                ? "text-white"
                                : "text-muted-foreground"
                        }`}
                        style={{ fontFamily: "Inter" }}
                    >
                        {selectedUsers.length > 0
                            ? `Neste (${selectedUsers.length} valgt)`
                            : "Velg minst én bruker"}
                    </Text>
                </Pressable>
            </View>
        </PageWrapper>
    );
}
