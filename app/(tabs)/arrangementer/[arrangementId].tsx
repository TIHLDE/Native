import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View, Image, ActivityIndicator } from "react-native";
import MarkdownView from "@/components/ui/MarkdownView";
import { Card } from "@/components/ui/card";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/ui/pagewrapper";
import { BASE_URL } from "@/actions/constant";
import { Button } from "@/components/ui/button";
import { iAmRegisteredToEvent, registerToEvent, unregisterFromEvent } from "@/actions/events/registrations";
import { Event, Registration } from "@/actions/types";
import Alert from "@/components/ui/alert";
import { useEffect, useRef, useState } from "react";
import useInterval from "@/lib/useInterval";
import { createPayment } from "@/actions/events/payments";
import * as WebBrowser from "expo-web-browser";
import me, { usePermissions } from "@/actions/users/me";
import Toast from "react-native-toast-message";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Icon from "@/lib/icons/Icon";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { publicEventParticipants } from "@/actions/events/participants";
import { InteropBottomSheetModal } from "@/lib/interopBottomSheet";
import UserCard from "@/components/ui/userCard";
import ImageMissing from "@/components/ui/imageMissing";
import useRefresh from "@/lib/useRefresh";

// Importer funksjoner fra date-fns med norsk locale
import { format, isBefore, isAfter } from "date-fns";
import { nb } from "date-fns/locale";

export default function ArrangementSide() {
    const params = useLocalSearchParams();
    const queryClient = useQueryClient();
    const id = params.arrangementId;
    const router = useRouter();
    const permissions = usePermissions();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const event = useQuery({
        queryKey: ["event", id],
        queryFn: async (): Promise<Event> => {
            return fetch(`${BASE_URL}/events/${id}`).then((res) => res.json());
        },
    });

    const { data: registration } = useQuery({
        queryKey: ["event", id, "registration"],
        queryFn: async () => iAmRegisteredToEvent(Number(id)),
    });

    const registrationMutation = useMutation({
        mutationFn: async (eventId: number) => {
            if (registration) {
                return unregisterFromEvent(eventId);
            }
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
                <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                    <Text className="text-lg">Laster arrangement...</Text>
                </View>
            </>
        );
    }

    if (event.error || permissions.isError) {
        return (
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-lg text-red-500">Feil: {event.error?.message}</Text>
            </View>
        );
    }

    if (!event) {
        return (
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-lg">Ingen data funnet.</Text>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Screen options={{ title: '' }} />
            <PageWrapper>
                <ScrollView refreshControl={refreshControl}>
                    <View>
                        {event.data.image
                            ? <Image
                                source={{ uri: event.data.image }}
                                className="w-full h-48"
                                resizeMode="cover"
                            />
                            :
                            <View className="w-full h-48 bg-primary-foreground flex items-center justify-center">
                                <ImageMissing />
                            </View>
                        }
                    </View>
                    <View className="flex flex-col text-3xl px-2 py-5">
                        <Text className="text-4xl font-semibold pl-2">{event.data.title}</Text>
                        <Card className="mx-auto w-[100%] border-2 border-gray-200 dark:border-gray-900 bg-card rounded-lg mt-5 px-3 py-2">
                            <Text className="text-2xl mb-6  font-bold">Detaljer</Text>
                            <View className="flex flex-row justify-start items-start">
                                <View className="ml-2 mr-10">
                                    <Text className="text-md text-muted-foreground mb-2">Fra:</Text>
                                    <Text className="text-md text-muted-foreground mb-2">Til:</Text>
                                    <Text className="text-md text-muted-foreground mb-2">Sted:</Text>
                                    <Text className="text-md text-muted-foreground mb-2">Arrangør:</Text>
                                    <Text className="text-md text-muted-foreground mb-2">Kontaktperson:</Text>
                                    {event.data.paid_information?.price && (
                                        <Text className="text-md ">Pris:</Text>
                                    )}
                                </View>
                                <View>
                                    <Text className="text-md mb-2">
                                        {new Date(event.data.start_date).toLocaleDateString("no-NO", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}{" "}
                                        kl.{" "}
                                        {new Date(event.data.start_date).toLocaleTimeString("no-NO", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Text>
                                    <Text className="text-md mb-2">
                                        {new Date(event.data.end_date).toLocaleDateString("no-NO", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}{" "}
                                        kl.{" "}
                                        {new Date(event.data.end_date).toLocaleTimeString("no-NO", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Text>
                                    <Text className="text-md mb-2">{event.data.location || "Ikke oppgitt"}</Text>
                                    <Text className="text-md mb-2">{event.data.organizer?.name || "Ikke oppgitt"}</Text>
                                    <Text className="text-md mb-2">
                                        {event.data.contact_person
                                            ? `${event.data.contact_person.first_name} ${event.data.contact_person.last_name}`
                                            : "Ikke oppgitt"}
                                    </Text>
                                    {event.data.paid_information?.price && (
                                        <Text className="text-md">{event.data.paid_information.price}</Text>
                                    )}
                                </View>
                            </View>
                        </Card>
                        {permissions.data?.event?.write &&
                            <Button onPress={() => router.push({
                                pathname: "/arrangementer/eventRegisterModal",
                                params: { eventId: id },
                            })} className="mt-5">
                                <Text>Registrer oppmøte </Text>
                            </Button>
                        }
                        {
                            event.data.sign_up && <>
                                <Card className="mx-auto w-[100%] border-2 border-gray-200 dark:border-gray-900 bg-card rounded-lg mt-5 px-3 py-2">
                                    <Text className="text-2xl mb-6 font-bold">Påmelding</Text>
                                    <View className="flex flex-row justify-start items-start">
                                        <View className="mr-10">
                                            <Text className="text-md text-muted-foreground mb-2">Påmeldte:</Text>
                                            <Text className="text-md text-muted-foreground mb-2">Venteliste:</Text>
                                            <Text className="text-md text-muted-foreground mb-2">Avmeldingsfrist:</Text>
                                        </View>
                                        <View>
                                            <Text className="text-md mb-2">
                                                {event.data.list_count}/{event.data.limit === 0 ? "∞" : event.data.limit}
                                            </Text>
                                            <Text className="text-md mb-2">
                                                {event.data.waiting_list_count}
                                            </Text>
                                            <Text className="text-md mb-2">
                                                {new Date(event.data.sign_off_deadline).toLocaleDateString("no-NO", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}{" "}
                                                kl.{" "}
                                                {new Date(event.data.sign_off_deadline).toLocaleTimeString("no-NO", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="absolute right-0 top-0">
                                        <Button variant="ghost" onPress={() => {
                                            bottomSheetModalRef.current?.present();

                                        }}>
                                            <Icon icon="UserRound" className="color-primary stroke-2" />
                                        </Button>
                                    </View>
                                </Card>
                                <RegistrationButton
                                    event={event.data}
                                    registration={registration}
                                    mutationPending={registrationMutation.isPending}
                                    onClick={() => registrationMutation.mutate(Number(id))}
                                />
                            </>
                        }
                        <View className="p-5">
                            <Text className="text-2xl font-bold mb-4">{event.data.title}</Text>
                            <MarkdownView content={event.data.description ?? "Ingen beskrivelse tilgjengelig"} />
                        </View>
                    </View>
                    <InteropBottomSheetModal ref={bottomSheetModalRef}
                        backgroundStyleClassName="bg-primary-foreground rounded-3xl"
                        snapPoints={["50%", "75%"]}
                        enableDynamicSizing={false}

                        backdropComponent={(props) => (
                            <BottomSheetBackdrop
                                opacity={0.5}
                                appearsOnIndex={0}
                                disappearsOnIndex={-1}
                                {...props}
                            />
                        )} >
                        <EventParticipantsModal eventId={Number(id)} />
                    </InteropBottomSheetModal>
                </ScrollView>
            </PageWrapper>
        </GestureHandlerRootView>
    );
}

function EventParticipantsModal({ eventId }: { eventId: number }) {
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
            if (!lastPage || lastPage.length === 0) return undefined;
            return lastPageParam + 1;
        },
    });

    if (isError) {
        return (
            <BottomSheetView className="p-5 bg-primary-foreground">
                <Text className="text-center mt-4 text-xl text-destructive p-4">
                    Kunne ikke hente deltagere. Prøv igjen senere.
                </Text>
            </BottomSheetView>
        );
    }

    if (isPending) {
        return (
            <BottomSheetView className="p-5 bg-primary-foreground">
                <ActivityIndicator />
            </BottomSheetView>
        );
    }

    return (
        <BottomSheetFlatList
            className="p-5 bg-primary-foreground"
            data={data?.pages.flatMap((page) => (page ? page.filter((registration) => registration.user_info !== null) : []))}
            renderItem={({ item: registration }) => <UserCard user={registration.user_info} />}
            onEndReached={() => fetchNextPage()}
            ListHeaderComponent={
                <>
                    <Text className="m-auto text-3xl"> Deltagerliste </Text>
                    <View className="border-t border-muted-foreground w-full mt-5 mb-5" />
                </>
            }
            ListFooterComponent={
                <View className="h-20">
                    {isFetchingNextPage && <ActivityIndicator />}
                    {!hasNextPage && (
                        <Text className="text-center mt-4 text-muted-foreground">
                            Ingen{data?.pages[0] && data.pages[0].length > 0 && " flere"} påmeldte
                        </Text>
                    )}
                </View>
            }
        />
    );
}

function RegistrationButton({
    event,
    registration,
    onClick,
    mutationPending,
}: {
    event: Event;
    registration?: Registration | null;
    onClick?: () => void;
    mutationPending?: boolean;
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

    // Countdown: Bruker date-fns for å sammenligne start- og betalingsdato
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

    const [showUnregisterDialog, setShowUnregisterDialog] = useState<boolean>();

    if (user.isPending) return <></>;

    return (
        <>
            {showAlert && (
                <Alert type={alertType} className="mt-5">
                    <Text>
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
                </Alert>
            )}

            {showCountdown && countdownTime && countdownIsForPayment && <PaymentButton eventId={event.id} />}

            {isAfter(new Date(event.end_date), new Date()) && (
                <Button
                    onPress={() => {
                        if (isBefore(new Date(event.end_registration_at), new Date()) && registration) {
                            setShowUnregisterDialog(true);
                            return;
                        }
                        onClick?.();
                    }}
                    className="mt-5"
                    variant={isDestructive ? "destructive" : "default"}
                    disabled={isDisabled}
                >
                    {mutationPending ? (
                        <ActivityIndicator />
                    ) : (
                        <>
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
                                <Text>{buttonText}</Text>
                            )}
                        </>
                    )}
                </Button>
            )}
            <AlertDialog open={showUnregisterDialog} onOpenChange={setShowUnregisterDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Ved å melde deg av dette arrangementet vil du få en prikk
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            <Text>Avbryt</Text>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button onPress={() => onClick?.()}>
                                <Text>Bekreft</Text>
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
        <Button
            onPress={() => {
                const paymentLink = payment.data?.payment_link || "https://tihlde.org/arrangementer/" + eventId;
                WebBrowser.openBrowserAsync(paymentLink).then(() => {
                    queryClient.invalidateQueries({ queryKey: ["event"] });
                    queryClient.refetchQueries({ queryKey: ["event"] });
                });
            }}
            className="mx-5 mt-5"
            variant="default"
            disabled={payment.isPending}
        >
            {payment.isPending ? <ActivityIndicator /> : <Text>Betal her</Text>}
        </Button>
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
    // Vi regner ut gjenstående tid i millisekunder
    const [remaining, setRemaining] = useState<number>(startCount.getTime());

    useInterval(() => {
        setRemaining((prev) => prev - interval);
    }, interval);

    useEffect(() => {
        if (remaining <= 0) {
            onCountdownFinished?.();
        }
    }, [remaining, onCountdownFinished]);

    // Mer enn 48 timer igjen
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

    // Mellom 48 og 24 timer igjen
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
