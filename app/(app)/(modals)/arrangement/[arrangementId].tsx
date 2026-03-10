import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View, Image, ActivityIndicator, Pressable } from "react-native";
import MarkdownView from "@/components/ui/MarkdownView";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/ui/pagewrapper";
import { BASE_URL } from "@/actions/constant";
import { iAmRegisteredToEvent, registerToEvent, unregisterFromEvent } from "@/actions/events/registrations";
import { Event, Registration } from "@/actions/types";
import { useEffect, useRef, useState } from "react";
import useInterval from "@/lib/useInterval";
import { createPayment } from "@/actions/events/payments";
import * as WebBrowser from "expo-web-browser";
import me, { usePermissions } from "@/actions/users/me";
import Toast from "react-native-toast-message";
import Icon from "@/lib/icons/Icon";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { publicEventParticipants } from "@/actions/events/participants";
import { InteropBottomSheetModal } from "@/lib/interopBottomSheet";
import UserCard from "@/components/ui/userCard";
import ImageMissing from "@/components/ui/imageMissing";
import useRefresh from "@/lib/useRefresh";
import { SectionHeader } from "@/components/ui/section-header";
import { useColorScheme } from "@/lib/useColorScheme";
import { isBefore, isAfter } from "date-fns";
import {
    CalendarDays,
    Clock,
    MapPin,
    Users,
    UserRound,
    CreditCard,
    CalendarOff,
    ClipboardList,
    CircleCheck,
    LogOut,
    ChevronLeft,
    TriangleAlert,
    Info,
    OctagonX,
} from "lucide-react-native";

function DetailRow({
    icon,
    label,
    value,
    isLast = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    isLast?: boolean;
}) {
    return (
        <>
            <View className="flex-row items-center px-4 py-3.5">
                {icon}
                <View className="ml-3 flex-1">
                    <Text className="text-xs text-muted-foreground mb-0.5" style={{ fontFamily: "Inter" }}>
                        {label}
                    </Text>
                    <Text className="text-base text-foreground" numberOfLines={1}>
                        {value}
                    </Text>
                </View>
            </View>
            {!isLast && <View className="h-px bg-border dark:bg-muted ml-12" />}
        </>
    );
}

function DetailSkeleton() {
    return (
        <PageWrapper className="flex-1 bg-background">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image skeleton */}
                <View className="w-full aspect-[16/9] bg-muted dark:bg-secondary/40 animate-pulse" />

                <View className="px-6 pt-5">
                    {/* Title skeleton */}
                    <View className="h-7 w-3/4 bg-muted dark:bg-secondary/40 rounded-md animate-pulse mb-2" />
                    <View className="h-4 w-1/3 bg-muted dark:bg-secondary/40 rounded-md animate-pulse mb-6" />

                    {/* Details card skeleton */}
                    <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden mb-6">
                        {[1, 2, 3, 4].map((i) => (
                            <View key={i}>
                                <View className="flex-row items-center px-4 py-3.5">
                                    <View className="w-[18px] h-[18px] bg-muted dark:bg-secondary/50 rounded animate-pulse" />
                                    <View className="ml-3">
                                        <View className="h-3 w-16 bg-muted dark:bg-secondary/50 rounded animate-pulse mb-1.5" />
                                        <View className="h-4 w-32 bg-muted dark:bg-secondary/50 rounded animate-pulse" />
                                    </View>
                                </View>
                                {i < 4 && <View className="h-px bg-border dark:bg-muted ml-12" />}
                            </View>
                        ))}
                    </View>

                    {/* Registration card skeleton */}
                    <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden mb-6">
                        {[1, 2, 3].map((i) => (
                            <View key={i}>
                                <View className="flex-row items-center px-4 py-3.5">
                                    <View className="w-[18px] h-[18px] bg-muted dark:bg-secondary/50 rounded animate-pulse" />
                                    <View className="ml-3">
                                        <View className="h-3 w-16 bg-muted dark:bg-secondary/50 rounded animate-pulse mb-1.5" />
                                        <View className="h-4 w-24 bg-muted dark:bg-secondary/50 rounded animate-pulse" />
                                    </View>
                                </View>
                                {i < 3 && <View className="h-px bg-border dark:bg-muted ml-12" />}
                            </View>
                        ))}
                    </View>

                    {/* Button skeleton */}
                    <View className="h-14 bg-muted dark:bg-secondary/40 rounded-2xl animate-pulse mb-6" />

                    {/* Content skeleton */}
                    <View className="gap-2">
                        <View className="h-4 w-full bg-muted dark:bg-secondary/40 rounded animate-pulse" />
                        <View className="h-4 w-5/6 bg-muted dark:bg-secondary/40 rounded animate-pulse" />
                        <View className="h-4 w-4/6 bg-muted dark:bg-secondary/40 rounded animate-pulse" />
                    </View>
                </View>
            </ScrollView>
        </PageWrapper>
    );
}

export default function ArrangementSide() {
    const params = useLocalSearchParams();
    const queryClient = useQueryClient();
    const id = params.arrangementId;
    const router = useRouter();
    const permissions = usePermissions();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const unregisterSheetRef = useRef<BottomSheetModal>(null);
    const { isDarkColorScheme } = useColorScheme();
    const mutedColor = isDarkColorScheme ? '#9ca3af' : '#6b7280';

    const event = useQuery({
        queryKey: ["event", id],
        queryFn: async (): Promise<Event> => {
            return fetch(`${BASE_URL}/events/${id}`).then((res) => res.json());
        },
    });

    const { data: registration, isPending: registrationPending } = useQuery({
        queryKey: ["event", id, "registration"],
        queryFn: async () => iAmRegisteredToEvent(Number(id)),
    });

    const registrationMutation = useMutation({
        mutationFn: async (eventId: number) => {
            return registerToEvent(eventId);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["event"] });
        },
        onError: (error) => {
            if (!error.message) {
                Toast.show({
                    text1: "Feil",
                    text2: "Kunne ikke melde deg på arrangementet. Prøv igjen senere.",
                    type: "error",
                });
                return;
            }
            Toast.show({
                text1: "Feil",
                text2: error.message,
                type: "error",
            });
        },
    });

    const refreshControl = useRefresh(["event", id as string]);

    if (event.isPending || permissions.isPending) {
        return (
            <>
                <Stack.Screen options={{ title: "" }} />
                <DetailSkeleton />
            </>
        );
    }

    if (event.error || permissions.isError) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <Stack.Screen options={{ title: "" }} />
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-base text-destructive">{event.error?.message}</Text>
                </View>
            </PageWrapper>
        );
    }

    if (!event.data) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <Stack.Screen options={{ title: "" }} />
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-base text-muted-foreground">Ingen data funnet.</Text>
                </View>
            </PageWrapper>
        );
    }

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("no-NO", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const formatTime = (dateStr: string) =>
        new Date(dateStr).toLocaleTimeString("no-NO", {
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Screen options={{
                title: event.data.organizer?.name || '',
                headerLeft: () => (
                    <Pressable onPress={() => router.back()} className="flex-row items-center -ml-2">
                        <ChevronLeft size={28} color={isDarkColorScheme ? '#ffffff' : '#000000'} />
                        <Text className="text-[17px] text-foreground -ml-1">Tilbake</Text>
                    </Pressable>
                ),
            }} />
            <PageWrapper className="flex-1 bg-background">
                <ScrollView
                    refreshControl={refreshControl}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Hero image */}
                    <View className="w-full aspect-[16/9] overflow-hidden">
                        {event.data.image ? (
                            <Image
                                source={{ uri: event.data.image }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <ImageMissing />
                        )}
                    </View>

                    <View className="px-6">
                        {/* Title section */}
                        <View className="pt-5 pb-1 mb-4">
                            <Text className="text-2xl font-bold text-foreground mb-1">
                                {event.data.title}
                            </Text>
                            <Text className="text-base text-muted-foreground">
                                {event.data.organizer?.name || "Ukjent arrangør"}
                            </Text>
                        </View>

                        {/* Details card */}
                        <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden mb-6">
                            <DetailRow
                                icon={<CalendarDays size={18} color={mutedColor} />}
                                label="Dato"
                                value={formatDate(event.data.start_date)}
                            />
                            <DetailRow
                                icon={<Clock size={18} color={mutedColor} />}
                                label="Tid"
                                value={`${formatTime(event.data.start_date)} – ${formatTime(event.data.end_date)}`}
                            />
                            <DetailRow
                                icon={<MapPin size={18} color={mutedColor} />}
                                label="Sted"
                                value={event.data.location || "Ikke oppgitt"}
                            />
                            <DetailRow
                                icon={<UserRound size={18} color={mutedColor} />}
                                label="Kontaktperson"
                                value={
                                    event.data.contact_person
                                        ? `${event.data.contact_person.first_name} ${event.data.contact_person.last_name}`
                                        : "Ikke oppgitt"
                                }
                            />
                            {event.data.paid_information?.price && (
                                <DetailRow
                                    icon={<CreditCard size={18} color={mutedColor} />}
                                    label="Pris"
                                    value={event.data.paid_information.price}
                                    isLast
                                />
                            )}
                        </View>

                        {/* Admin: register attendance button */}
                        {permissions.data?.event?.write && event.data.sign_up && (
                            <Pressable
                                onPress={() => router.push({
                                    pathname: "/(modals)/arrangement/[arrangementId]/event-register",
                                    params: { arrangementId: id as string },
                                })}
                                className="h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex-row items-center justify-center mb-6 active:opacity-70"
                            >
                                <ClipboardList size={18} color={isDarkColorScheme ? '#8ba3d4' : '#2d5dab'} />
                                <Text className="text-base font-semibold text-primary dark:text-accent ml-2" style={{ fontFamily: "Inter" }}>
                                    Registrer oppmøte
                                </Text>
                            </Pressable>
                        )}

                        {/* Registration section */}
                        {event.data.sign_up && (
                            <>
                                <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden mb-4">
                                    <DetailRow
                                        icon={<Users size={18} color={mutedColor} />}
                                        label="Påmeldte"
                                        value={`${event.data.list_count}/${event.data.limit === 0 ? "∞" : event.data.limit}`}
                                    />
                                    <DetailRow
                                        icon={<Users size={18} color={mutedColor} />}
                                        label="Venteliste"
                                        value={String(event.data.waiting_list_count)}
                                    />
                                    <DetailRow
                                        icon={<CalendarOff size={18} color={mutedColor} />}
                                        label="Avmeldingsfrist"
                                        value={`${formatDate(event.data.sign_off_deadline)} kl. ${formatTime(event.data.sign_off_deadline)}`}
                                        isLast
                                    />
                                </View>

                                <RegistrationButton
                                    event={event.data}
                                    registration={registration}
                                    registrationPending={registrationPending}
                                    mutationPending={registrationMutation.isPending}
                                    onClick={() => registrationMutation.mutate(Number(id))}
                                    unregisterSheetRef={unregisterSheetRef}
                                />

                                {/* View participants button */}
                                <Pressable
                                    onPress={() => bottomSheetModalRef.current?.present()}
                                    className="flex-row items-center justify-center py-3 mb-2 active:opacity-70"
                                >
                                    <Icon icon="UserRound" className="color-primary dark:color-accent stroke-2" />
                                    <Text className="text-sm font-semibold text-primary dark:text-accent ml-1.5" style={{ fontFamily: "Inter" }}>
                                        Se deltagerliste
                                    </Text>
                                </Pressable>
                            </>
                        )}

                        {/* Description */}
                        {event.data.description && (
                            <View className="mt-6 mb-4">
                                <SectionHeader title="Om arrangementet" className="mb-4" />
                                <MarkdownView content={event.data.description} />
                            </View>
                        )}
                    </View>

                    <InteropBottomSheetModal ref={bottomSheetModalRef}
                        backgroundStyleClassName="bg-primary-foreground rounded-3xl"
                        snapPoints={["75%"]}
                        index={0}
                        enableDynamicSizing={false}
                        backdropComponent={(props) => (
                            <BottomSheetBackdrop
                                opacity={0.5}
                                appearsOnIndex={0}
                                disappearsOnIndex={-1}
                                {...props}
                            />
                        )} >
                        <EventParticipantsModal eventId={Number(id)} totalCount={event.data.list_count} />
                    </InteropBottomSheetModal>

                    <InteropBottomSheetModal ref={unregisterSheetRef}
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
                        <UnregisterDrawer
                            eventId={Number(id)}
                            isPastDeadline={isBefore(new Date(event.data.sign_off_deadline), new Date())}
                            sheetRef={unregisterSheetRef}
                        />
                    </InteropBottomSheetModal>
                </ScrollView>
            </PageWrapper>
        </GestureHandlerRootView>
    );
}

function UnregisterDrawer({
    eventId,
    isPastDeadline,
    sheetRef,
}: {
    eventId: number;
    isPastDeadline: boolean;
    sheetRef: React.RefObject<BottomSheetModal | null>;
}) {
    const { isDarkColorScheme } = useColorScheme();
    const queryClient = useQueryClient();
    const [status, setStatus] = useState<'confirm' | 'loading' | 'success'>('confirm');

    const unregisterMutation = useMutation({
        mutationFn: () => unregisterFromEvent(eventId),
        onSuccess: async () => {
            setStatus('success');
            await queryClient.invalidateQueries({ queryKey: ["event"] });
            setTimeout(() => {
                sheetRef.current?.dismiss();
                // Reset state after dismiss animation
                setTimeout(() => setStatus('confirm'), 300);
            }, 2500);
        },
        onError: (error) => {
            setStatus('confirm');
            sheetRef.current?.dismiss();
            Toast.show({
                text1: "Feil",
                text2: error.message || "Kunne ikke melde deg av. Prøv igjen senere.",
                type: "error",
            });
        },
    });

    const handleUnregister = () => {
        setStatus('loading');
        unregisterMutation.mutate();
    };

    if (status === 'loading') {
        return (
            <BottomSheetView className="bg-primary-foreground px-6 pb-10 pt-8">
                <View className="items-center py-4">
                    <ActivityIndicator size="large" />
                    <Text className="text-base text-muted-foreground mt-4">
                        Melder deg av...
                    </Text>
                </View>
            </BottomSheetView>
        );
    }

    if (status === 'success') {
        return (
            <BottomSheetView className="bg-primary-foreground px-6 pb-10 pt-6">
                <View className="items-center py-4">
                    <View className="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-4">
                        <CircleCheck size={26} color={isDarkColorScheme ? '#8ba3d4' : '#2d5dab'} />
                    </View>
                    <Text className="text-xl font-bold text-foreground text-center">
                        Avmeldt
                    </Text>
                    <Text className="text-sm text-muted-foreground text-center mt-1">
                        Du er nå meldt av arrangementet.
                    </Text>
                </View>
            </BottomSheetView>
        );
    }

    return (
        <BottomSheetView className="bg-primary-foreground px-6 pb-10 pt-6">
            <View className="items-center mb-4">
                <View className="w-14 h-14 rounded-full bg-destructive/10 dark:bg-destructive/20 items-center justify-center mb-4">
                    <TriangleAlert size={26} color={isDarkColorScheme ? '#f87171' : '#dc2626'} />
                </View>
                <Text className="text-xl font-bold text-foreground text-center">
                    Meld deg av?
                </Text>
                <Text className="text-sm text-muted-foreground text-center mt-1">
                    {isPastDeadline
                        ? 'Avmeldingsfristen har gått ut. Ved å melde deg av vil du få en prikk.'
                        : 'Er du sikker på at du vil melde deg av dette arrangementet?'
                    }
                </Text>
            </View>
            <View className="gap-y-2">
                <Pressable
                    onPress={handleUnregister}
                    className="h-12 rounded-2xl bg-destructive items-center justify-center active:opacity-80"
                >
                    <Text className="text-white text-base font-semibold" style={{ fontFamily: "Inter" }}>
                        Meld meg av
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => sheetRef.current?.dismiss()}
                    className="h-12 rounded-2xl bg-gray-100 dark:bg-secondary/30 items-center justify-center active:bg-gray-200 dark:active:bg-secondary/50"
                >
                    <Text className="text-base font-medium text-foreground" style={{ fontFamily: "Inter" }}>
                        Avbryt
                    </Text>
                </Pressable>
            </View>
        </BottomSheetView>
    );
}

function EventParticipantsModal({ eventId, totalCount }: { eventId: number; totalCount: string }) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isPending,
        isFetchingNextPage,
        isError,
    } = useInfiniteQuery({
        queryKey: ["event", eventId, "participants", "public"],
        queryFn: async ({ pageParam }) => await publicEventParticipants(eventId, pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.next === null) return undefined;
            return lastPageParam + 1;
        },
    });

    if (isError) {
        return (
            <BottomSheetView className="bg-primary-foreground flex-1">
                <View className="px-4 pt-4 pb-3">
                    <Text className="text-lg font-bold text-center text-foreground">Deltagerliste</Text>
                </View>
                <View className="h-px bg-border dark:bg-muted" />
                <Text className="text-center mt-8 text-base text-destructive px-4">
                    Kunne ikke hente deltagere. Prøv igjen senere.
                </Text>
            </BottomSheetView>
        );
    }

    if (isPending) {
        return (
            <BottomSheetView className="bg-primary-foreground flex-1">
                <View className="px-4 pt-4 pb-3">
                    <Text className="text-lg font-bold text-center text-foreground">Deltagerliste</Text>
                </View>
                <View className="h-px bg-border dark:bg-muted" />
                <View className="pt-8">
                    <ActivityIndicator />
                </View>
            </BottomSheetView>
        );
    }

    const participants = data?.pages.flatMap((page) =>
        page ? page.results.filter((registration) => registration.user_info !== null) : []
    ) ?? [];

    return (
        <BottomSheetFlatList
            className="bg-primary-foreground"
            data={participants}
            stickyHeaderIndices={[0]}
            renderItem={({ item: registration }) => (
                <>
                    <UserCard user={registration.user_info} />
                    <View className="h-px bg-border dark:bg-muted" />
                </>
            )}
            keyExtractor={(item, index) => item.user_info?.user_id?.toString() ?? index.toString()}
            onEndReached={() => {
                if (!hasNextPage) return;
                fetchNextPage();
            }}
            ListHeaderComponent={
                <View className="bg-primary-foreground">
                    <View className="px-4 pt-4 pb-3">
                        <Text className="text-lg font-bold text-center text-foreground">Deltagerliste</Text>
                        <Text className="text-sm text-muted-foreground text-center mt-0.5">
                            {totalCount} deltager{totalCount !== '1' ? 'e' : ''}
                        </Text>
                    </View>
                    <View className="h-px bg-border dark:bg-muted" />
                </View>
            }
            ListFooterComponent={
                <View className="h-20">
                    {isFetchingNextPage && <ActivityIndicator />}
                </View>
            }
        />
    );
}

function RegistrationButton({
    event,
    registration,
    registrationPending,
    onClick,
    mutationPending,
    unregisterSheetRef,
}: {
    event: Event;
    registration?: Registration | null;
    registrationPending?: boolean;
    onClick?: () => void;
    mutationPending?: boolean;
    unregisterSheetRef: React.RefObject<BottomSheetModal | null>;
}) {
    const user = useQuery({
        queryKey: ["users", "me"],
        queryFn: me,
    });

    const hasUnansweredEvaluations = user.data?.unanswered_evaluations_count !== 0;
    const [isDisabled, setIsDisabled] = useState<boolean>();
    const isDestructive = registration;

    const getButtonText = (event: Event) => {
        if (isBefore(new Date(event.end_registration_at), new Date()) && !registration) {
            return "Påmeldingsfrist utløpt";
        }
        if (registration) {
            return "Meld deg av arrangementet";
        }
        const waitingList = Number(event.waiting_list_count);
        if (waitingList > 0) {
            return `Meld deg på plass ${waitingList + 1} i ventelisten`;
        }
        return "Meld deg på arrangementet";
    };

    const [buttonText, setButtonText] = useState<string>("");

    const showAlert = registration || hasUnansweredEvaluations;
    const alertType =
        (registration?.is_on_wait && "info") ||
        (event.paid_information && !registration?.has_paid_order && registration && "warning") ||
        (hasUnansweredEvaluations && "error") ||
        "success";

    const getAlertMessage = () => {
        if (registration?.is_on_wait) {
            return `Du er på plass ${registration.wait_queue_number} av ${event.waiting_list_count} på ventelisten. Vi gir deg beskjed om du får plass.`;
        }
        if (hasUnansweredEvaluations && user.data?.unanswered_evaluations_count) {
            return `Du må svare på ${user.data?.unanswered_evaluations_count > 1 ? user.data?.unanswered_evaluations_count : "ett"
                } evalueringsskjema${user.data?.unanswered_evaluations_count > 1 ? "er" : ""} før du kan melde deg på flere arrangementer. Du finner dine ubesvarte evalueringsskjemaer under "Spørreskjemaer" på profilsiden.`;
        }
        if (isBefore(new Date(event.start_date), new Date())) {
            return "Du har deltatt på arrangementet!";
        }
        return "Du er påmeldt arrangementet.";
    };

    const alertMessage = getAlertMessage();

    const countdownIsForPayment = event.paid_information && !registration?.has_paid_order && registration;
    const countdownTime =
        (isAfter(new Date(event.start_registration_at), new Date()) && new Date(event.start_registration_at)) ||
        (event.paid_information &&
            registration?.payment_expiredate &&
            isAfter(new Date(registration.payment_expiredate), new Date()) &&
            new Date(registration.payment_expiredate));

    const [showCountdown, setShowCountdown] = useState<boolean>();

    useEffect(() => {
        setIsDisabled(
            (isBefore(new Date(event.end_registration_at), new Date()) && !registration) ||
            isAfter(new Date(event.start_registration_at), new Date()) ||
            registration?.has_paid_order ||
            mutationPending ||
            user.data?.unanswered_evaluations_count === undefined ||
            user.data.unanswered_evaluations_count > 0 ||
            !event.sign_up ||
            false
        );
        if (countdownTime) {
            setShowCountdown(true);
        }
        setButtonText(getButtonText(event));
    }, [event, registration, user]);

    if (user.isPending || registrationPending) {
        return (
            <View className="h-14 bg-muted dark:bg-secondary/40 rounded-2xl animate-pulse mb-2" />
        );
    }

    const statusBannerStyles: Record<string, { bg: string; iconColor: string; textColor: string }> = {
        success: { bg: 'bg-primary/10 dark:bg-primary/20', iconColor: '#2d5dab', textColor: 'text-primary dark:text-accent' },
        info: { bg: 'bg-orange-100 dark:bg-orange-500/20', iconColor: '#ea580c', textColor: 'text-orange-600 dark:text-orange-400' },
        warning: { bg: 'bg-orange-100 dark:bg-orange-500/20', iconColor: '#ea580c', textColor: 'text-orange-600 dark:text-orange-400' },
        error: { bg: 'bg-destructive/10 dark:bg-destructive/20', iconColor: '#dc2626', textColor: 'text-destructive' },
    };

    const statusIcon: Record<string, React.ReactNode> = {
        success: <CircleCheck size={18} color={statusBannerStyles.success.iconColor} />,
        info: <Info size={18} color={statusBannerStyles.info.iconColor} />,
        warning: <TriangleAlert size={18} color={statusBannerStyles.warning.iconColor} />,
        error: <OctagonX size={18} color={statusBannerStyles.error.iconColor} />,
    };

    const bannerStyle = statusBannerStyles[alertType] ?? statusBannerStyles.success;

    return (
        <>
            {showAlert && (
                <View className={`flex-row items-center px-4 py-3.5 rounded-2xl mb-4 ${bannerStyle.bg}`}>
                    {statusIcon[alertType]}
                    <View className="ml-3 flex-1">
                        <Text className={`text-sm ${bannerStyle.textColor}`}>
                            {showCountdown && countdownTime && countdownIsForPayment ? (
                                <CountTextWrapper
                                    interval={1000}
                                    prefix="Du er påmeldt, men har "
                                    suffix=" på å betale for å beholde plassen."
                                    startCount={new Date(countdownTime.getTime() - Date.now())}
                                />
                            ) : (
                                alertMessage
                            )}
                        </Text>
                    </View>
                </View>
            )}

            {showCountdown && countdownTime && countdownIsForPayment && <PaymentButton eventId={event.id} />}

            {isAfter(new Date(event.end_date), new Date()) && (
                isDestructive ? (
                    /* Unregister button — matches profile logout style */
                    <Pressable
                        onPress={() => unregisterSheetRef.current?.present()}
                        disabled={isDisabled || mutationPending}
                        className={`h-14 rounded-2xl flex-row items-center justify-center mb-2 active:opacity-70 ${
                            isDisabled ? 'bg-destructive/5 dark:bg-destructive/10' : 'bg-destructive/10 dark:bg-destructive/20'
                        }`}
                    >
                        {mutationPending ? (
                            <ActivityIndicator />
                        ) : (
                            <>
                                <LogOut size={18} color={isDisabled ? '#f8717180' : '#dc2626'} />
                                <Text className={`text-base font-semibold ml-2 ${isDisabled ? 'text-destructive/50' : 'text-destructive'}`} style={{ fontFamily: "Inter" }}>
                                    {buttonText}
                                </Text>
                            </>
                        )}
                    </Pressable>
                ) : (
                    /* Register button */
                    <Pressable
                        onPress={() => onClick?.()}
                        disabled={isDisabled || mutationPending}
                        className={`h-14 rounded-2xl flex-row items-center justify-center mb-2 active:opacity-80 ${
                            isDisabled ? 'bg-primary/40 dark:bg-primary/30' : 'bg-primary dark:bg-[#1C5ECA]'
                        }`}
                    >
                        {mutationPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-base font-semibold" style={{ fontFamily: "Inter" }}>
                                {showCountdown && countdownTime && !countdownIsForPayment ? (
                                    <CountTextWrapper
                                        interval={1000}
                                        prefix="Påmelding åpner om "
                                        suffix=""
                                        startCount={new Date(countdownTime.getTime() - Date.now())}
                                        onCountdownFinished={() => {
                                            setShowCountdown(false);
                                            setIsDisabled(false);
                                            setButtonText("Meld deg på arrangementet");
                                        }}
                                    />
                                ) : (
                                    buttonText
                                )}
                            </Text>
                        )}
                    </Pressable>
                )
            )}
        </>
    );
}

function PaymentButton({ eventId }: { eventId: number }) {
    const queryClient = useQueryClient();

    const payment = useQuery({
        queryFn: () => createPayment(eventId),
        queryKey: ["event", eventId, "payment"],
    });

    return (
        <Pressable
            onPress={() => {
                const paymentLink = payment.data?.payment_link || "https://tihlde.org/arrangementer/" + eventId;
                WebBrowser.openBrowserAsync(paymentLink).then(() => {
                    queryClient.invalidateQueries({ queryKey: ["event"] });
                    queryClient.refetchQueries({ queryKey: ["event"] });
                });
            }}
            disabled={payment.isPending}
            className={`h-14 rounded-2xl flex-row items-center justify-center mb-4 active:opacity-80 ${
                payment.isPending ? 'bg-primary/40 dark:bg-primary/30' : 'bg-primary dark:bg-[#1C5ECA]'
            }`}
        >
            {payment.isPending ? (
                <ActivityIndicator color="white" />
            ) : (
                <>
                    <CreditCard size={16} color="white" />
                    <Text className="text-white text-base font-semibold ml-2" style={{ fontFamily: "Inter" }}>
                        Betal her
                    </Text>
                </>
            )}
        </Pressable>
    );
}

function CountTextWrapper({
    interval,
    prefix,
    suffix,
    startCount,
    onCountdownFinished,
}: {
    interval: number;
    prefix: string;
    suffix: string;
    startCount: Date;
    onCountdownFinished?: () => void;
}) {
    const [remaining, setRemaining] = useState<number>(startCount.getTime());

    useInterval(() => {
        setRemaining((prev) => prev - interval);
    }, interval);

    useEffect(() => {
        if (remaining <= 0) {
            onCountdownFinished?.();
        }
    }, [remaining, onCountdownFinished]);

    if (remaining > 1000 * 60 * 60 * 24 * 2) {
        const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
        return (
            <Text>
                {prefix}
                {days} dager
                {suffix}
            </Text>
        );
    }

    if (remaining > 1000 * 60 * 60 * 24) {
        const hours = Math.ceil(remaining / (1000 * 60 * 60));
        return (
            <Text>
                {prefix}
                {hours} timer
                {suffix}
            </Text>
        );
    }

    if (remaining > 1000 * 60 * 60) {
        const minutes = Math.ceil(remaining / (1000 * 60));
        return (
            <Text>
                {prefix}
                {minutes} minutter
                {suffix}
            </Text>
        );
    }

    if (remaining > 1000 * 60) {
        const seconds = Math.ceil(remaining / 1000);
        return (
            <Text>
                {prefix}
                {seconds} sekunder
                {suffix}
            </Text>
        );
    }

    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((remaining / (1000 * 60)) % 60);
    const seconds = Math.floor((remaining / 1000) % 60);
    return (
        <Text>
            {prefix}
            {hours} timer, {minutes} minutter og {seconds} sekunder {suffix}
        </Text>
    );
}
