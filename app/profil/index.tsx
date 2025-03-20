import me, { myEvents, myPreviousEvents } from "@/actions/users/me";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { deleteToken } from "@/lib/storage/tokenStore";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Image, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import { Event } from "@/actions/types";
import AnimatedPagerView from "@/components/ui/AnimatedPagerView";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import EventCard, {
    EventCardSkeleton,
} from "@/components/arrangement/eventCard";
import { ThemeToggle } from "@/components/themeToggle";
import useRefresh from "@/lib/useRefresh";

export default function Profil() {
    const { setAuthState } = useAuth();
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

    const refreshControl = useRefresh(["users", "me"]);

    const onLogout = async () => {
        const isLoggedOut = await deleteToken();

        if (!isLoggedOut) {
            return Toast.show({
                type: "error",
                text1: "Feil",
                text2: "Kunne ikke logge ut. Prøv igjen.",
            });
        }

        setAuthState!({
            auhtenticated: false,
            isLoading: false,
            token: null,
        });

        router.replace("/(auth)/login");
    };

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
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="flex-1 min-h-full mx-8" variant="destructive">
                                <Text>Logg ut</Text>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="p-8">
                            <AlertDialogTitle>
                                Er du sikker på at du vil logge ut?
                            </AlertDialogTitle>
                            <AlertDialogAction asChild>
                                <Button variant="destructive" onPressIn={onLogout}>
                                    <Text>Logg ut</Text>
                                </Button>
                            </AlertDialogAction>
                            <AlertDialogCancel>
                                <Text>Avbryt</Text>
                            </AlertDialogCancel>
                        </AlertDialogContent>
                    </AlertDialog>
                    <View className="my-2 border-t border-muted-foreground mx-8" />
                    {!userEvents.isPending && !previousEvents.isPending && (
                        <AnimatedPagerView
                            titles={["Dine arrangementer", "Tidligere arrangementer"]}
                        >
                            <View key={0} className="max-h-[40vh]">
                                <ScrollView bounces={false} nestedScrollEnabled>
                                    <DisplayUserEvents userEvents={userEvents} />
                                </ScrollView>
                            </View>
                            <View key={1} className="max-h-[40vh]">
                                <ScrollView bounces={false} nestedScrollEnabled>
                                    <DisplayUserEvents userEvents={previousEvents} previous />
                                </ScrollView>
                            </View>
                        </AnimatedPagerView>
                    )}
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

    if (userEvents.data.results.length === 0) {
        return (
            <Text className="text-center h-fit">
                {previous
                    ? "Du har ikke deltatt på noen arrangementer"
                    : "Du er ikke påmeldt noen arrangementer."}
            </Text>
        );
    }

    return userEvents.data.results.map((event) => (
        <EventCard
            key={event.id}
            id={event.id.toString()}
            title={event.title}
            date={new Date(event.start_date)}
            image={event.image ?? null}
            organizer={event.organizer ?? { name: "Ukjent", slug: null }}
            onPress={() => {
                router.push({
                    pathname: `/profil/eventmodal`,
                    params: { arrangementId: event.id },
                });
            }}
        />
    ));
}