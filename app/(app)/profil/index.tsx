import me, { myEvents } from "@/actions/users/me";
import PageWrapper from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { deleteToken } from "@/lib/storage/tokenStore";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Image, Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import { Event } from "@/actions/types";
import EventCard, {
    EventCardSkeleton,
} from "@/components/arrangement/eventCard";
import useRefresh from "@/lib/useRefresh";
import { Mail, GraduationCap, LogOut, TriangleAlert } from "lucide-react-native";
import { useColorScheme } from "@/lib/useColorScheme";
import { SectionHeader } from "@/components/ui/section-header";
import { useRef } from "react";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { InteropBottomSheetModal } from "@/lib/interopBottomSheet";

export default function Profil() {
    const { setAuthState } = useAuth();
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();
    const logoutSheetRef = useRef<BottomSheetModal>(null);

    const user = useQuery({
        queryKey: ["users", "me"],
        queryFn: me,
    });

    const userEvents = useQuery({
        queryKey: ["users", "me", "events"],
        queryFn: myEvents,
    });

    const refreshControl = useRefresh(["users", "me"]);


    const mutedColor = isDarkColorScheme ? '#9ca3af' : '#6b7280';

    if (user.isPending) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <ScrollView refreshControl={refreshControl} contentContainerStyle={{flexGrow: 1}}>
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-base text-muted-foreground">Laster profil...</Text>
                    </View>
                </ScrollView>
            </PageWrapper>
        );
    }

    if (user.isError) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <ScrollView refreshControl={refreshControl} contentContainerStyle={{flexGrow: 1}}>
                    <View className="flex-1 items-center justify-center px-6">
                        <Text className="text-base text-destructive">{user.error.message}</Text>
                    </View>
                </ScrollView>
            </PageWrapper>
        );
    }

    const initials = `${user.data.first_name[0]}${user.data.last_name[0]}`;

    const handleLogoutConfirm = async () => {
        logoutSheetRef.current?.dismiss();
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

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PageWrapper className="flex-1 bg-background">
                <ScrollView
                    refreshControl={refreshControl}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingBottom: 40}}
                >
                    {/* Profile hero */}
                    <View className="items-center pt-8 pb-6">
                        {user.data.image ? (
                            <Image
                                className="w-28 h-28 rounded-full"
                                source={{ uri: user.data.image }}
                            />
                        ) : (
                            <View className="w-28 h-28 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center">
                                <Text className="text-3xl font-bold text-primary dark:text-accent">
                                    {initials}
                                </Text>
                            </View>
                        )}

                        <Text className="text-2xl font-bold mt-4 text-foreground">
                            {user.data.first_name} {user.data.last_name}
                        </Text>
                        <Text className="text-base text-muted-foreground mt-0.5">
                            @{user.data.user_id}
                        </Text>
                    </View>

                    {/* Info section */}
                    <View className="px-6 mb-6">
                        <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden">
                            {/* Study */}
                            <View className="flex-row items-center px-4 py-3.5">
                                <GraduationCap size={18} color={mutedColor} />
                                <Text className="text-base text-foreground ml-3">
                                    {user.data.study.group.name}
                                </Text>
                            </View>

                            <View className="h-px bg-border dark:bg-muted ml-12" />

                            {/* Email */}
                            <View className="flex-row items-center px-4 py-3.5">
                                <Mail size={18} color={mutedColor} />
                                <Text className="text-base text-foreground ml-3">
                                    {user.data.email}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Events */}
                    <View className="px-6 mb-6">
                        <SectionHeader title="Påmeldte arrangementer" />
                        <DisplayUserEvents userEvents={userEvents} router={router} />
                    </View>

                    {/* Logout */}
                    <View className="px-6 mt-2">
                        <Pressable
                            onPress={() => logoutSheetRef.current?.present()}
                            className="flex-row items-center justify-center h-14 rounded-2xl bg-destructive/10 dark:bg-destructive/20 active:opacity-70"
                        >
                            <LogOut size={18} color={isDarkColorScheme ? '#f87171' : '#dc2626'} />
                            <Text className="text-base font-semibold text-destructive ml-2">
                                Logg ut
                            </Text>
                        </Pressable>
                    </View>

                    <InteropBottomSheetModal ref={logoutSheetRef}
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
                        <BottomSheetView className="bg-primary-foreground px-6 pb-10 pt-6">
                            <View className="items-center mb-4">
                                <View className="w-14 h-14 rounded-full bg-destructive/10 dark:bg-destructive/20 items-center justify-center mb-4">
                                    <TriangleAlert size={26} color={isDarkColorScheme ? '#f87171' : '#dc2626'} />
                                </View>
                                <Text className="text-xl font-bold text-foreground text-center">
                                    Logg ut
                                </Text>
                                <Text className="text-sm text-muted-foreground text-center mt-1">
                                    Er du sikker på at du vil logge ut av TIHLDE?
                                </Text>
                            </View>
                            <View className="gap-y-2">
                                <Pressable
                                    onPress={handleLogoutConfirm}
                                    className="h-12 rounded-2xl bg-destructive items-center justify-center active:opacity-80"
                                >
                                    <Text className="text-white text-base font-semibold" style={{ fontFamily: "Inter" }}>
                                        Logg ut
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => logoutSheetRef.current?.dismiss()}
                                    className="h-12 rounded-2xl bg-gray-100 dark:bg-secondary/30 items-center justify-center active:bg-gray-200 dark:active:bg-secondary/50"
                                >
                                    <Text className="text-base font-medium text-foreground" style={{ fontFamily: "Inter" }}>
                                        Avbryt
                                    </Text>
                                </Pressable>
                            </View>
                        </BottomSheetView>
                    </InteropBottomSheetModal>
                </ScrollView>
            </PageWrapper>
        </GestureHandlerRootView>
    );
}

function DisplayUserEvents({ userEvents, router }: {
    userEvents: UseQueryResult<{ results: Event[] }, Error>;
    router: ReturnType<typeof useRouter>;
}) {

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
        return <Text className="text-destructive text-center py-4">{userEvents.error.message}</Text>;
    }

    if (userEvents.data.results.length === 0) {
        return (
            <View className="py-8 items-center">
                <Text className="text-muted-foreground text-center">
                    Du er ikke påmeldt noen arrangementer
                </Text>
            </View>
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
                    pathname: "/(modals)/arrangement/[arrangementId]",
                    params: { arrangementId: event.id },
                });
            }}
        />
    ));
}
