import { avatarImageUrl } from "@/lib/images";
import { themeColors } from "@/lib/theme/colors";
import { Text } from "@/components/ui/text";
import PageWrapper, { TAB_SCREEN_EDGES, TAB_BAR_CLEARANCE } from "@/components/ui/pagewrapper";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";
import { fetchMemberships } from "@/actions/fines/memberships";
import { Membership } from "@/actions/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import { Camera, ChevronRight, Users, X } from "lucide-react-native";
import {
    imageParams,
    PickedImage,
    useFineImage,
} from "@/components/boter/useFineImage";
import { onFineSubmitted } from "@/lib/fines/fine-events";

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

export default function MembershipSelection() {
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();
    const mutedColor = themeColors(isDarkColorScheme).mutedForeground;

    const memberships = useQuery({
        queryKey: ["memberships"],
        queryFn: fetchMemberships,
    });

    const refreshControl = useRefresh("memberships");

    const finesGroups =
        memberships.data?.filter((m: Membership) => m.group.finesActivated) ?? [];

    // BotBlitz: bildet tas før gruppa er valgt. Det blir liggende til boten
    // er gitt, brukeren forkaster det eller tar et nytt, så den som går inn i
    // feil gruppe og tilbake ikke mister bildet.
    const [pendingImage, setPendingImage] = useState<PickedImage | null>(null);
    const { pickImage, takePhoto } = useFineImage();

    useEffect(() => onFineSubmitted(() => setPendingImage(null)), []);

    const openGroup = (groupSlug: string, image: PickedImage | null) => {
        router.push({
            pathname: "/(app)/(modals)/boter/[groupSlug]",
            params: { groupSlug, ...imageParams(image) },
        });
    };

    const blitz = async (source: "camera" | "library") => {
        const image =
            source === "camera" ? await takePhoto() : await pickImage();
        if (!image) return;
        // Også med én gruppe, så bildet står klart om brukeren går tilbake.
        setPendingImage(image);

        if (finesGroups.length === 1) {
            // Et push i samme tikk som velgeren lukkes kan miste overgangen
            // på iOS.
            const slug = finesGroups[0].group.slug;
            setTimeout(() => openGroup(slug, image), 0);
        }
    };

    return (
        <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
            <FlatList
                data={finesGroups}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 12,
                    // Plass til BotBlitz-knappen over det nederste kortet.
                    paddingBottom: TAB_BAR_CLEARANCE + 72,
                }}
                refreshControl={refreshControl}
                keyExtractor={(item) => item.group.slug}
                ListHeaderComponent={
                    pendingImage ? (
                        <View className="mx-4 mb-3 bg-primary/10 dark:bg-primary/20 rounded-2xl p-3 flex-row items-center">
                            <Image
                                source={{ uri: pendingImage.uri }}
                                className="w-12 h-12 rounded-xl"
                                resizeMode="cover"
                            />
                            <Text className="flex-1 ml-3 text-sm font-semibold text-primary">
                                Bilde klart – velg gruppe
                            </Text>
                            <Pressable
                                onPress={() => setPendingImage(null)}
                                accessibilityLabel="Forkast bildet"
                                hitSlop={8}
                                className="w-8 h-8 rounded-full items-center justify-center active:opacity-70"
                            >
                                <X size={18} color={mutedColor} />
                            </Pressable>
                        </View>
                    ) : undefined
                }
                renderItem={({ item: membership }) => (
                    <Pressable
                        onPress={() =>
                            openGroup(membership.group.slug, pendingImage)
                        }
                        className="mx-4 mb-3 bg-gray-100 dark:bg-secondary/30 rounded-2xl p-4 flex-row items-center active:opacity-70"
                    >
                        {membership.group.image ? (
                            <Image
                                source={{
                                    uri: avatarImageUrl(membership.group.image),
                                }}
                                className="w-12 h-12 rounded-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-12 h-12 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center">
                                <Users
                                    size={20}
                                    color={
                                        themeColors(isDarkColorScheme).primary
                                    }
                                />
                            </View>
                        )}
                        <View className="flex-1 ml-3">
                            <Text className="text-base font-semibold text-foreground">
                                {membership.group.name}
                            </Text>
                            <Text className="text-sm text-muted-foreground mt-0.5">
                                {membership.membershipType === "LEADER"
                                    ? "Leder"
                                    : "Medlem"}
                            </Text>
                        </View>
                        <ChevronRight size={20} color={mutedColor} />
                    </Pressable>
                )}
                ListEmptyComponent={
                    memberships.isPending ? (
                        <View>
                            <MembershipCardSkeleton />
                            <MembershipCardSkeleton />
                            <MembershipCardSkeleton />
                        </View>
                    ) : memberships.isError ? (
                        <View className="flex-1 items-center justify-center px-6 pt-16">
                            <Text className="text-base text-destructive">
                                {memberships.error.message}
                            </Text>
                        </View>
                    ) : (
                        <View className="py-16 items-center">
                            <View className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-4">
                                <Users
                                    size={28}
                                    color={
                                        themeColors(isDarkColorScheme).primary
                                    }
                                />
                            </View>
                            <Text className="text-lg font-semibold text-foreground mb-1">
                                Ingen grupper
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center px-8">
                                Du er ikke medlem av noen grupper med bøter
                                aktivert.
                            </Text>
                        </View>
                    )
                }
            />

            {finesGroups.length > 0 && (
                <Pressable
                    onPress={() => blitz("camera")}
                    onLongPress={() => blitz("library")}
                    accessibilityRole="button"
                    accessibilityLabel="BotBlitz – ta bilde til bot"
                    accessibilityHint="Hold inne for å velge fra biblioteket"
                    className="absolute right-4 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg active:opacity-80"
                    style={{ bottom: TAB_BAR_CLEARANCE }}
                >
                    <Camera
                        size={24}
                        color={themeColors(isDarkColorScheme).primaryForeground}
                    />
                </Pressable>
            )}
        </PageWrapper>
    );
}
