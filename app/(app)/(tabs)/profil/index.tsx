import me, { myEvents, myPreviousEvents, myMemberships } from "@/actions/users/me";
import PageWrapper from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Image, ScrollView, View, ActivityIndicator } from "react-native";
import { Event, Group } from "@/actions/types";
import AnimatedPagerView from "@/components/ui/AnimatedPagerView";
import EventCard, {
    EventCardSkeleton,
} from "@/components/arrangement/eventCard";
import useRefresh from "@/lib/useRefresh";
import { Card, CardContent } from "@/components/ui/card";

export default function Profil() {
    const router = useRouter();

    const user = useQuery({
        queryKey: ["users", "me"],
        queryFn: me,
    });

    const userEvents = useQuery({
        queryKey: ["users", "me", "events"],
        queryFn: myEvents,
    });

    const previousEvents = useQuery({
        queryKey: ["users", "me", "previous-events"],
        queryFn: myPreviousEvents,
    });

    const memberships = useQuery({
        queryKey: ["users", "me", "memberships"],
        queryFn: myMemberships,
    });

    const refreshControl = useRefresh(["users", "me", "memberships"]);

    if (user.isPending) {
        return (
            <PageWrapper>
                <ScrollView refreshControl={refreshControl}>
                    <Text className="text-lg">Laster profil...</Text>
                </ScrollView>
            </PageWrapper>
        );
    }

    if (user.isError) {
        return (
            <PageWrapper>
                <ScrollView refreshControl={refreshControl}>
                    <Text className="text-lg text-red-500">Feil: {user.error.message}</Text>
                </ScrollView>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <ScrollView refreshControl={refreshControl}>
                <View className="flex flex-col gap-4 p-4">
                    {user.data.image && (
                        <Image
                            className="w-24 h-24 rounded-full m-auto"
                            source={{ uri: user.data.image }}
                        />
                    )}
                    <View className="mt-2 flex flex-col justify-center items-center">
                        <Text className="text-2xl font-semibold">
                            {user.data.first_name} {user.data.last_name}
                        </Text>
                        <Text className="text-lg text-muted-foreground">
                            @{user.data.user_id}
                        </Text>
                        <Text className="text-lg">{user.data.study.group.name}</Text>
                        <Text className="text-lg">{user.data.email}</Text>
                    </View>
                    <View className="my-2 border-t border-muted-foreground mx-8" />
                    
                    {/* Memberships Section */}
                    <View className="flex flex-col gap-3">
                        <Text className="text-xl font-semibold">Mine grupper</Text>
                        {memberships.isPending ? (
                            <View className="flex items-center justify-center p-4">
                                <ActivityIndicator />
                            </View>
                        ) : memberships.isError ? (
                            <Text className="text-red-500 text-sm">
                                Kunne ikke laste grupper
                            </Text>
                        ) : memberships.data && memberships.data.length > 0 ? (
                            <View className="flex flex-col gap-2">
                                {memberships.data.map((group) => (
                                    <View key={group.slug}>
                                        <Card className="p-3">
                                            <CardContent className="p-0">
                                                <View className="flex flex-row items-center justify-between">
                                                    <View className="flex flex-row items-center gap-3 flex-1">
                                                        {group.image && (
                                                            <Image
                                                                source={{ uri: group.image }}
                                                                className="w-12 h-12 rounded-lg"
                                                                resizeMode="cover"
                                                            />
                                                        )}
                                                        <View className="flex-1">
                                                            <Text className="text-lg font-semibold">
                                                                {group.name}
                                                            </Text>
                                                            {group.membership_type && (
                                                                <Text className="text-sm text-muted-foreground">
                                                                    {group.membership_type}
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                    {group.fines_activated && (
                                                        <View className="bg-primary/20 px-2 py-1 rounded">
                                                            <Text className="text-xs text-primary font-medium">
                                                                Bøter
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </CardContent>
                                        </Card>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text className="text-muted-foreground text-sm">
                                Du er ikke medlem av noen grupper
                            </Text>
                        )}
                    </View>
                    
                    <View className="my-2 border-t border-muted-foreground mx-8" />
                    <View className="h-[300px] relative">
                        <AnimatedPagerView
                            titles={["Påmeldt", "Tidligere"]}
                        >
                            <View key={0} className="flex-1">
                                <ScrollView bounces={false} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                    <DisplayUserEvents userEvents={userEvents} />
                                </ScrollView>
                            </View>
                            <View key={1} className="flex-1">
                                <ScrollView bounces={false} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                    <DisplayUserEvents userEvents={previousEvents} previous />
                                </ScrollView>
                            </View>
                        </AnimatedPagerView>
                    </View>
                </View>
            </ScrollView>
        </PageWrapper>
    );
}

function DisplayUserEvents({ userEvents, previous }: {
    userEvents: UseQueryResult<{ results: Event[] }, Error>;
    previous?: boolean;
}) {
    const router = useRouter();

    if (userEvents.isPending) {
        return (
            <>
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
            </>
        );
    }

    if (userEvents.isError) {
        return <Text>Error: {userEvents.error.message}</Text>;
    }

    if (!userEvents.data || !userEvents.data.results || userEvents.data.results.length === 0) {
        return (
            <Text className="text-center h-fit">
                {previous
                    ? "Du har ikke deltatt på noen arrangementer"
                    : "Du er ikke påmeldt noen arrangementer."}
            </Text>
        );
    }

    return (
        <>
            {userEvents.data.results.map((event) => (
                <EventCard
                    key={event.id}
                    id={event.id.toString()}
                    title={event.title}
                    date={new Date(event.start_date)}
                    image={event.image ?? null}
                    organizer={event.organizer ?? { name: "Ukjent", slug: null }}
                    onPress={() => {
                        router.push({
                            pathname: "/(app)/(modals)/arrangement/[arrangementId]",
                            params: { arrangementId: event.id },
                        });
                    }}
                />
            ))}
        </>
    );
}
