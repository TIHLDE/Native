import { themeColors } from "@/lib/theme/colors";
import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View, ActivityIndicator, Pressable } from "react-native";
import MarkdownView from "@/components/ui/MarkdownView";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/ui/pagewrapper";
import { fetchEvent, fetchEventCounts } from "@/actions/events/events";
import { iAmRegisteredToEvent, registerToEvent, unregisterFromEvent } from "@/actions/events/registrations";
import { Event, Registration } from "@/actions/types";
import { useRef, useState } from "react";
import useInterval from "@/lib/useInterval";
import { createPayment } from "@/actions/events/payments";
import { VippsButton } from "@/components/ui/vipps-button";
import * as WebBrowser from "expo-web-browser";
import { usePermissions } from "@/actions/users/me";
import Toast from "react-native-toast-message";
import Icon from "@/lib/icons/Icon";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { publicEventParticipants } from "@/actions/events/participants";
import { InteropBottomSheetModal } from "@/lib/interopBottomSheet";
import UserCard from "@/components/ui/userCard";
import CoverImage, { COVER_IMAGE_FRAME } from "@/components/ui/coverImage";
import useRefresh from "@/lib/useRefresh";
import { SectionHeader } from "@/components/ui/section-header";
import EventRulesConsent from "@/components/events/EventRulesConsent";
import {
    TICKET_RESALE_GROUP_URL,
    deriveRegistrationState,
    formatCountdown,
    formatTimeUntil,
    registrationErrorMessage,
} from "@/lib/events/registrationState";
import { useEventRulesConsent } from "@/lib/useEventRulesConsent";
import { useColorScheme } from "@/lib/useColorScheme";
import { isBefore } from "date-fns";
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
    Ticket,
} from "lucide-react-native";

/**
 * Datoformatene skjermen bruker. Lå tidligere inne i sidekomponenten, men
 * påmeldingskortet trenger dem også — det viser når påmeldingen åpner og når
 * betalingsfristen går ut.
 */
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
                <View className={`${COVER_IMAGE_FRAME} bg-muted dark:bg-secondary/40 animate-pulse`} />

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
    const mutedColor = themeColors(isDarkColorScheme).mutedForeground;

    const event = useQuery({
        queryKey: ["event", id],
        queryFn: async (): Promise<Event> => {
            return fetchEvent(String(id));
        },
    });

    const { data: registration, isPending: registrationPending } = useQuery({
        queryKey: ["event", id, "registration"],
        queryFn: async () => iAmRegisteredToEvent(String(id)),
    });

    // Tallene ligger ikke på arrangementet i Photon; de telles på
    // påmeldingslista. Egen spørring, så siden vises selv om den feiler.
    const { data: counts } = useQuery({
        queryKey: ["event", id, "counts"],
        queryFn: async () => fetchEventCounts(String(id)),
    });

    const registrationMutation = useMutation({
        mutationFn: async (eventId: string) => {
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
                    {/* Begge spørringene kan feile hver for seg. Uten
                        rettighetsfeilen her ble skjermen helt hvit når det var
                        den som røk. */}
                    <Text className="text-base text-destructive text-center">
                        {event.error?.message ??
                            permissions.error?.message ??
                            "Kunne ikke laste arrangementet."}
                    </Text>
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

    /**
     * Photon lar tidspunktene stå tomme der Lepton alltid hadde dem. En tom
     * streng blir en ugyldig dato, som både vises som «Invalid Date» og gjør
     * enhver sammenligning usann uten å si fra.
     */
    const isValidDate = (dateStr: string) =>
        Boolean(dateStr) && !Number.isNaN(new Date(dateStr).getTime());

    const hasSignOffDeadline = isValidDate(event.data.sign_off_deadline);


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Screen options={{
                title: event.data.organizer?.name || '',
                headerLeft: () => (
                    <Pressable onPress={() => router.back()} className="flex-row items-center -ml-2">
                        <ChevronLeft size={28} color={themeColors(isDarkColorScheme).foreground} />
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
                    <CoverImage uri={event.data.image} />

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
                                    value={formatPrice(event.data.paid_information.price)}
                                    isLast
                                />
                            )}
                        </View>

                        {/* Admin: register attendance button */}
                        {permissions.data?.event?.write && event.data.sign_up && (
                            <Pressable
                                onPress={() => router.push({
                                    pathname: "/(app)/(modals)/arrangement/[arrangementId]/event-register",
                                    params: { arrangementId: id as string },
                                })}
                                className="h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex-row items-center justify-center mb-6 active:opacity-70"
                            >
                                <ClipboardList size={18} color={themeColors(isDarkColorScheme).primary} />
                                <Text className="text-base font-semibold text-primary ml-2" style={{ fontFamily: "Inter" }}>
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
                                        value={`${counts?.listCount ?? "–"}/${event.data.limit === 0 ? "∞" : event.data.limit}`}
                                    />
                                    {/* Ventelista er bare synlig for den som
                                        administrerer arrangementet. Raden står
                                        over når tallet er ukjent, framfor å
                                        vise 0 og lyve. */}
                                    {counts?.waitingListCount != null && (
                                        <DetailRow
                                            icon={<Users size={18} color={mutedColor} />}
                                            label="Venteliste"
                                            value={String(counts.waitingListCount)}
                                        />
                                    )}
                                    {/* Photon lar avmeldingsfristen stå tom;
                                        Lepton hadde den alltid. Uten sjekken
                                        her ble raden til «Invalid Date». */}
                                    {hasSignOffDeadline && (
                                        <DetailRow
                                            icon={<CalendarOff size={18} color={mutedColor} />}
                                            label="Avmeldingsfrist"
                                            value={`${formatDate(event.data.sign_off_deadline)} kl. ${formatTime(event.data.sign_off_deadline)}`}
                                            isLast
                                        />
                                    )}
                                </View>

                                <RegistrationButton
                                    event={event.data}
                                    registration={registration}
                                    registrationPending={registrationPending}
                                    mutationPending={registrationMutation.isPending}
                                    mutationError={registrationMutation.error}
                                    onClick={() => registrationMutation.mutate(String(id))}
                                    unregisterSheetRef={unregisterSheetRef}
                                />

                                {/* View participants button */}
                                <Pressable
                                    onPress={() => bottomSheetModalRef.current?.present()}
                                    className="flex-row items-center justify-center py-3 mb-2 active:opacity-70"
                                >
                                    <Icon icon="UserRound" className="color-primary stroke-2" />
                                    <Text className="text-sm font-semibold text-primary ml-1.5" style={{ fontFamily: "Inter" }}>
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
                        backgroundStyleClassName="bg-popover rounded-3xl"
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
                        <EventParticipantsModal eventId={String(id)} totalCount={String(counts?.listCount ?? 0)} />
                    </InteropBottomSheetModal>

                    <InteropBottomSheetModal ref={unregisterSheetRef}
                        backgroundStyleClassName="bg-popover rounded-3xl"
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
                            eventId={String(id)}
                            // Uten frist er det aldri for sent å melde seg av.
                            isPastDeadline={
                                hasSignOffDeadline &&
                                isBefore(new Date(event.data.sign_off_deadline), new Date())
                            }
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
    eventId: string;
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
            <BottomSheetView className="bg-popover px-6 pb-10 pt-8">
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
            <BottomSheetView className="bg-popover px-6 pb-10 pt-6">
                <View className="items-center py-4">
                    <View className="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-4">
                        <CircleCheck size={26} color={themeColors(isDarkColorScheme).primary} />
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
        <BottomSheetView className="bg-popover px-6 pb-10 pt-6">
            <View className="items-center mb-4">
                <View className="w-14 h-14 rounded-full bg-destructive/10 dark:bg-destructive/20 items-center justify-center mb-4">
                    <TriangleAlert size={26} color={themeColors(isDarkColorScheme).destructive} />
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

function EventParticipantsModal({ eventId, totalCount }: { eventId: string; totalCount: string }) {
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
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.next === null) return undefined;
            return lastPageParam + 1;
        },
    });

    if (isError) {
        return (
            <BottomSheetView className="bg-popover flex-1">
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
            <BottomSheetView className="bg-popover flex-1">
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
            className="bg-popover"
            data={participants}
            stickyHeaderIndices={[0]}
            renderItem={({ item: registration }: { item: Registration }) => (
                <>
                    <UserCard user={registration.user_info} />
                    <View className="h-px bg-border dark:bg-muted" />
                </>
            )}
            keyExtractor={(item: Registration, index: number) => item.user_info?.user_id?.toString() ?? index.toString()}
            onEndReached={() => {
                if (!hasNextPage) return;
                fetchNextPage();
            }}
            ListHeaderComponent={
                <View className="bg-popover">
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

/**
 * Påmeldingskortet.
 *
 * Bygger på tilstandsmaskinen i `lib/events/registrationState`, som er portert
 * fra nettsida. Tidligere sto det en håndfull løse booleans her, og de dekket
 * verken venteliste, betaling eller en påmelding som fortsatt behandles — så
 * appen sa noe annet enn nettsida om det samme arrangementet.
 */
function RegistrationButton({
    event,
    registration,
    registrationPending,
    onClick,
    mutationPending,
    mutationError,
    unregisterSheetRef,
}: {
    event: Event;
    registration?: Registration | null;
    registrationPending?: boolean;
    onClick?: () => void;
    mutationPending?: boolean;
    mutationError?: unknown;
    unregisterSheetRef: React.RefObject<BottomSheetModal | null>;
}) {
    const { isDarkColorScheme } = useColorScheme();
    const palette = themeColors(isDarkColorScheme);
    const eventRules = useEventRulesConsent();

    // Nedtellingene løper mens skjermen står åpen, så tilstanden må regnes fra
    // en klokke som tikker — ikke fra tidspunktet komponenten ble tegnet.
    const [now, setNow] = useState<Date>(() => new Date());
    useInterval(() => setNow(new Date()), 1000);

    // Photon legger egen påmelding på arrangementet. `registration` er igjen
    // fra da den måtte letes opp i påmeldingslista, og brukes som reserve.
    const mine = event.my_registration ?? registration ?? null;
    const state = deriveRegistrationState(event, mine, now);

    // Bare tilstandene der medlemmet ellers kunne meldt seg på — å be noen
    // godkjenne regler på et stengt arrangement hjelper ingen.
    const blockedByEventRules =
        eventRules.mustAccept &&
        (state === "open" || state === "not-open" || state === "full");

    if (registrationPending) {
        return (
            <View className="h-14 bg-muted dark:bg-secondary/40 rounded-2xl animate-pulse mb-2" />
        );
    }

    const errorText = mutationError
        ? registrationErrorMessage(mutationError)
        : null;

    const paymentCountdown = mine?.payment_expiredate
        ? formatCountdown(mine.payment_expiredate, now)
        : undefined;

    return (
        <>
            {state === "no-signup" && (
                <StatusBanner
                    tone="info"
                    palette={palette}
                    message="Dette arrangementet har ikke påmelding"
                    secondary="Bare møt opp."
                />
            )}

            {state === "processing" && (
                <StatusBanner
                    tone="info"
                    palette={palette}
                    message="Behandler påmeldingen din …"
                    secondary="Vi gir deg beskjed så snart plassen er klar."
                />
            )}

            {state === "not-open" && (
                <StatusBanner
                    tone="info"
                    palette={palette}
                    message={`Påmelding åpner om ${formatTimeUntil(event.start_registration_at, now)}`}
                    secondary={`${formatDate(event.start_registration_at)} kl. ${formatTime(event.start_registration_at)}.`}
                />
            )}

            {state === "closed" && (
                <StatusBanner
                    tone="error"
                    palette={palette}
                    message="Påmelding er stengt"
                />
            )}

            {state === "joined" && (
                <StatusBanner
                    tone="success"
                    palette={palette}
                    message="Du har plass på arrangementet!"
                    secondary={
                        mine?.has_paid_order
                            ? "Du har betalt, så plassen kan ikke meldes av."
                            : undefined
                    }
                />
            )}

            {state === "on-waitlist" && (
                <StatusBanner
                    tone="warning"
                    palette={palette}
                    message="Du er på venteliste"
                    secondary={
                        mine?.wait_queue_number
                            ? `Posisjon ${mine.wait_queue_number}. Du får plassen om noen melder seg av.`
                            : "Du får plassen om noen melder seg av."
                    }
                />
            )}

            {state === "awaiting-payment" && (
                <StatusBanner
                    tone="warning"
                    palette={palette}
                    message="Plass reservert — venter på betaling"
                    secondary={paymentDeadlineText(mine, paymentCountdown)}
                />
            )}

            {state === "full" && (
                <StatusBanner
                    tone="warning"
                    palette={palette}
                    message="Arrangementet er fullt"
                    secondary={
                        Number(event.waiting_list_count) > 0
                            ? `${event.waiting_list_count} står på venteliste.`
                            : "Meld deg på ventelista, så får du plassen om noen melder seg av."
                    }
                />
            )}

            {/*
              * Reglene må godkjennes før Photon slipper noen på, så samtykket
              * står der påmeldingsknappen ellers ville stått — også før
              * påmeldingen åpner, slik at det oppdages i god tid.
              */}
            {blockedByEventRules && (
                <EventRulesConsent
                    message={
                        state === "not-open"
                            ? "Gjør det nå, så er du klar når påmeldingen åpner."
                            : "Huk av, så kan du melde deg på med én gang."
                    }
                    onAccept={eventRules.acceptEventRules}
                    isSubmitting={eventRules.isSubmitting}
                    error={eventRules.error}
                />
            )}

            {/* Betaling: knappen hører til den reserverte plassen. */}
            {state === "awaiting-payment" && <PaymentButton eventId={event.id} />}

            {/* Påmelding, og venteliste — som går gjennom samme kall. */}
            {(state === "open" || state === "full") && !blockedByEventRules && (
                <Pressable
                    onPress={() => onClick?.()}
                    disabled={mutationPending}
                    className={`min-h-14 px-4 py-3 rounded-2xl flex-row items-center justify-center mb-2 active:opacity-80 ${
                        mutationPending ? "bg-primary/40 dark:bg-primary/30" : "bg-primary"
                    }`}
                >
                    {mutationPending ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text
                            className="text-white text-base font-semibold text-center"
                            style={{ fontFamily: "Inter" }}
                        >
                            {state === "full"
                                ? "Meld deg på ventelista"
                                : "Meld deg på arrangementet"}
                        </Text>
                    )}
                </Pressable>
            )}

            {/* Billetten kan ikke gis fra seg — den selges videre. */}
            {state === "joined" && mine?.has_paid_order && (
                <Pressable
                    onPress={() => WebBrowser.openBrowserAsync(TICKET_RESALE_GROUP_URL)}
                    className="h-14 rounded-2xl flex-row items-center justify-center mb-2 border border-border active:opacity-70"
                >
                    <Ticket size={18} color={palette.foreground} />
                    <Text
                        className="text-base font-semibold text-foreground ml-2"
                        style={{ fontFamily: "Inter" }}
                    >
                        Selg billetten din
                    </Text>
                </Pressable>
            )}

            {/*
              * Avmelding. En betalt plass kan ikke meldes av — Photon avviser
              * det, og knappen ville bare gitt en avvisning tilbake.
              */}
            {(state === "joined" || state === "on-waitlist" || state === "awaiting-payment") &&
                !mine?.has_paid_order && (
                    <Pressable
                        onPress={() => unregisterSheetRef.current?.present()}
                        disabled={mutationPending}
                        className="h-14 rounded-2xl flex-row items-center justify-center mb-2 active:opacity-70 bg-destructive/10 dark:bg-destructive/20"
                    >
                        {mutationPending ? (
                            <ActivityIndicator />
                        ) : (
                            <>
                                <LogOut size={18} color={palette.destructive} />
                                <Text
                                    className="text-base font-semibold ml-2 text-destructive"
                                    style={{ fontFamily: "Inter" }}
                                >
                                    {state === "on-waitlist"
                                        ? "Meld deg av ventelista"
                                        : "Meld deg av arrangementet"}
                                </Text>
                            </>
                        )}
                    </Pressable>
                )}

            {/*
              * Uten denne så knappen ut til å ikke gjøre noe når Photon avviste
              * påmeldingen. Her havner også avvisningene som forteller at
              * arrangementet ikke er for deg.
              */}
            {errorText && (
                <View className="flex-row items-start px-4 py-3.5 rounded-2xl mb-2 bg-destructive/10 dark:bg-destructive/20">
                    <OctagonX size={18} color={palette.destructive} />
                    <Text className="flex-1 text-sm text-destructive ml-3">
                        {errorText}
                    </Text>
                </View>
            )}
        </>
    );
}

/** Uten frist står plassen til arrangøren rydder opp. Da er det riktigere å si
 *  ingenting enn å dikte opp en frist. */
function paymentDeadlineText(
    registration: Registration | null,
    countdown: string | null | undefined,
): string | undefined {
    if (!registration?.payment_expiredate) return undefined;
    // Nedtellingen kan ha passert fristen før serveren har rukket å gi plassen
    // videre. «Betal innen 0 sekunder» er da feil — plassen er ute av
    // medlemmets hender, og det eneste ærlige er å si det.
    if (countdown === null) {
        return "Betalingsfristen er gått ut. Plassen kan ha gått videre til neste på ventelista.";
    }
    if (!countdown) return undefined;
    return `${countdown} igjen å betale (innen kl. ${formatTime(registration.payment_expiredate)}), ellers gis plassen videre.`;
}

const BANNER_TONES = {
    success: { bg: "bg-primary/10 dark:bg-primary/20", text: "text-primary" },
    info: { bg: "bg-muted/60 dark:bg-muted/30", text: "text-foreground" },
    warning: {
        bg: "bg-orange-100 dark:bg-orange-500/20",
        text: "text-orange-600 dark:text-orange-400",
    },
    error: {
        bg: "bg-destructive/10 dark:bg-destructive/20",
        text: "text-destructive",
    },
} as const;

function StatusBanner({
    tone,
    palette,
    message,
    secondary,
}: {
    tone: keyof typeof BANNER_TONES;
    palette: ReturnType<typeof themeColors>;
    message: string;
    secondary?: string;
}) {
    const styles = BANNER_TONES[tone];
    const icon = {
        success: <CircleCheck size={18} color={palette.primary} />,
        info: <Info size={18} color={palette.foreground} />,
        warning: <TriangleAlert size={18} color="#ea580c" />,
        error: <OctagonX size={18} color={palette.destructive} />,
    }[tone];

    return (
        <View className={`flex-row items-start px-4 py-3.5 rounded-2xl mb-4 ${styles.bg}`}>
            {icon}
            <View className="ml-3 flex-1">
                <Text className={`text-sm font-semibold ${styles.text}`}>{message}</Text>
                {secondary ? (
                    <Text className={`text-sm mt-1 ${styles.text} opacity-80`}>
                        {secondary}
                    </Text>
                ) : null}
            </View>
        </View>
    );
}


function PaymentButton({ eventId }: { eventId: string }) {
    const queryClient = useQueryClient();

    const payment = useQuery({
        queryFn: () => createPayment(eventId),
        queryKey: ["event", eventId, "payment"],
    });

    return (
        <VippsButton
            className="w-full mb-4"
            loading={payment.isPending}
            onPress={() => {
                // Uten en checkout-lenke er det ingenting å åpne. Tidligere
                // falt vi tilbake til arrangementssida på tihlde.org, men den
                // nettleseren deler ikke innloggingen med appen — brukeren
                // havnet på en side der de så ut til å ikke være påmeldt.
                const checkoutUrl = payment.data?.checkoutUrl;
                if (!checkoutUrl) {
                    Toast.show({
                        type: "error",
                        text1: "Kunne ikke starte betalingen",
                        text2: "Prøv igjen om litt.",
                    });
                    payment.refetch();
                    return;
                }

                WebBrowser.openBrowserAsync(checkoutUrl).then(() => {
                    queryClient.invalidateQueries({ queryKey: ["event"] });
                    queryClient.refetchQueries({ queryKey: ["event"] });
                });
            }}
        />
    );
}

/**
 * Photon oppgir prisen i øre; `toEvent` gjør om til kroner. Her handler det
 * bare om visningen: hele kroner uten desimaler, ører med komma slik norsk
 * skrivemåte er — «510 kr», ikke «510.0 kr».
 */
function formatPrice(kroner: string): string {
    const value = Number(kroner);
    if (!Number.isFinite(value)) return `${kroner} kr`;

    const decimals = Number.isInteger(value) ? 0 : 2;
    return `${value.toLocaleString("no-NO", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })} kr`;
}
