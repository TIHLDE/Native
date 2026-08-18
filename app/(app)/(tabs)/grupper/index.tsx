import { avatarImageUrl } from "@/lib/images";
import { themeColors } from "@/lib/theme/colors";
import { Text } from "@/components/ui/text";
import PageWrapper from "@/components/ui/pagewrapper";
import useRefresh from "@/lib/useRefresh";
import { useColorScheme } from "@/lib/useColorScheme";
import { fetchMemberships } from "@/actions/fines/memberships";
import { Membership } from "@/actions/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { FlatList, Image, Pressable, View } from "react-native";
import { ChevronRight, Users } from "lucide-react-native";

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

/**
 * Medlemskap alle får automatisk, og som ikke er grupper i den forstand folk
 * mener «gruppe»: selve TIHLDE, studieprogrammet og kullet. Ingen har meldt seg
 * inn i dem, de har ingen aktivitet, og de fylte lista med tre rader støy.
 *
 * Filteret går på type og ikke på navn — en skjult interessegruppe kan hete det
 * samme som studieprogrammet sitt, og den er reell og skal vises for dem som er
 * med. `private` og `interestgroup` slipper derfor gjennom.
 */
const AUTOMATIC_GROUP_TYPES = ["tihlde", "study", "studyyear"];

/**
 * Gruppene brukeren er med i.
 *
 * Til forskjell fra bot-fanen filtreres det ikke på `fines_activated` — «Grupper»
 * lover gruppene dine, og komiteer og undergrupper uten bøtesystem hører med. De
 * som mangler bøter merkes i stedet, sånn at det ikke overrasker at
 * bøtefanen inne på gruppa er tom.
 */
export default function Grupper() {
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();
    const mutedColor = themeColors(isDarkColorScheme).mutedForeground;

    const memberships = useQuery({
        queryKey: ["memberships"],
        queryFn: fetchMemberships,
    });

    const refreshControl = useRefresh("memberships");

    // Ukjent type beholdes framfor å skjules — en ny gruppetype i Photon skal
    // dukke opp i lista, ikke forsvinne stille.
    const groups =
        memberships.data?.filter(
            (item) =>
                !item.group.type ||
                !AUTOMATIC_GROUP_TYPES.includes(item.group.type.toLowerCase())
        ) ?? [];

    return (
        <PageWrapper className="flex-1 bg-background">
            <FlatList
                data={groups}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
                refreshControl={refreshControl}
                keyExtractor={(item) => item.group.slug}
                renderItem={({ item: membership }: { item: Membership }) => (
                    <Pressable
                        onPress={() =>
                            router.push({
                                pathname: "/(app)/(modals)/gruppe/[groupSlug]",
                                params: { groupSlug: membership.group.slug },
                            })
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
                            <View className="flex-row items-center mt-0.5">
                                <Text className="text-sm text-muted-foreground">
                                    {membership.membership_type === "LEADER"
                                        ? "Leder"
                                        : "Medlem"}
                                </Text>
                                {!membership.group.fines_activated ? (
                                    <Text className="text-sm text-muted-foreground">
                                        {" · Uten bøter"}
                                    </Text>
                                ) : null}
                            </View>
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
                                Du er ikke medlem av noen grupper.
                            </Text>
                        </View>
                    )
                }
            />
        </PageWrapper>
    );
}
