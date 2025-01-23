import { Text } from "@/components/ui/text";
import { Stack, useLocalSearchParams } from "expo-router";
import { View, Image, ActivityIndicator } from "react-native";
import MarkdownView from "@/components/ui/MarkdownView";
import { Card } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "@/components/ui/pagewrapper";
import { BASE_URL } from "@/actions/constant";
import { Button } from "@/components/ui/button";
import { iAmRegisteredToEvent, registerToEvent, unregisterFromEvent } from "@/actions/events/registrations";
import { Event, Registration } from "@/actions/types";
import Alert from "@/components/ui/alert";
import { useEffect, useState } from "react";
import useInterval from "@/lib/useInterval";
import { createPayment } from "@/actions/events/payments";
import * as WebBrowser from 'expo-web-browser';
import me from "@/actions/users/me";

export default function ArrangementSide() {
    const params = useLocalSearchParams();
    const queryClient = useQueryClient();
    const id = params.arrangementId;

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
                return unregisterFromEvent(eventId)
            }

            return registerToEvent(eventId);
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["event", id] });
            await queryClient.invalidateQueries({ queryKey: ["event", id, "registration"] });
        }
    });


    if (event.isPending) {
        return (
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-lg">Laster arrangement...</Text>
            </View>
        );
    }

    if (event.error) {
        return (
            <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                <Text className="text-lg text-red-500">Feil: {event.error.message}</Text>
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
        <PageWrapper refreshQueryKey={[["user"], ["event", id as string]]}>
            <Stack.Screen options={{ title: event.data.title }} />
            <View>
                {event.data.image && (
                    <Image
                        source={{ uri: event.data.image }}
                        className="w-full h-64"
                        resizeMode="contain"
                    />
                )}
            </View>
            <Card className="mx-auto w-[90%] shadow-lg rounded-lg mt-10 pl-10 pr-10 pt-5 pb-5">
                <Text className="text-2xl mb-6  font-bold">Detaljer</Text>
                <View className="flex flex-row justify-start items-start">
                    <View className="mr-10">
                        <Text className="text-md text-gray-400 mb-2">Fra:</Text>
                        <Text className="text-md text-gray-400 mb-2">Til:</Text>
                        <Text className="text-md text-gray-400 mb-2">Sted:</Text>
                        <Text className="text-md text-gray-400 mb-2">Arrangør:</Text>
                        <Text className="text-md text-gray-400 mb-2">Kontaktperson:</Text>
                        {event.data.paid_information?.price && (
                            <Text className="text-md text-gray-400">Pris:</Text>
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
            {event.data.sign_up &&
                <>
                    <Card className="mx-auto w-[90%] shadow-lg rounded-lg mt-10 pl-10 pr-10 pt-5 pb-5">
                        <Text className="text-2xl mb-6 font-bold">Påmelding</Text>
                        <View className="flex flex-row justify-start items-start">
                            <View className="mr-10">
                                <Text className="text-md text-gray-400 mb-2">Påmeldte:</Text>
                                <Text className="text-md text-gray-400 mb-2">Venteliste:</Text>
                                <Text className="text-md text-gray-400 mb-2">Avmeldingsfrist:</Text>
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
                    </Card>
                    <RegistrationButton
                        event={event.data}
                        registration={registration}
                        mutationPending={registrationMutation.isPending}
                        onClick={() => registrationMutation.mutate(Number(id))}
                    />
                </>
            }
            <Card className="mx-auto w-[90%] shadow-lg rounded-lg mt-10 pl-10 pr-10 pt-5 pb-5">
                <Text className="text-2xl font-bold mb-4">{event.data.title}</Text>
                <MarkdownView content={event.data.description || "Ingen beskrivelse tilgjengelig"} />
            </Card>
        </PageWrapper>
    );
}


// Would be ideal to move the registration query and mutation here, but i cant get it to
// immediately refetch when the page is refreshed via page-wrapper.
function RegistrationButton({ event, registration, onClick, mutationPending }: { event: Event, registration?: Registration | null, onClick?: () => void, mutationPending?: boolean }) {

    const user = useQuery({
        queryKey: ["users", "me"],
        queryFn: me,
    });

    const hasUnansweredEvaluations = user.data?.unanswered_evaluations_count !== 0;

    // all button stuff:
    const [isDisabled, setIsDisabled] = useState<boolean>(
        new Date(event.end_registration_at) < new Date()
        || new Date(event.start_registration_at) > new Date()
        || registration?.has_paid_order
        || mutationPending
        || user.isPending
        || user.data?.unanswered_evaluations_count === undefined
        || user.data.unanswered_evaluations_count > 0
        || false
    )

    const isDestructive = registration;

    const getButtonText = (event: Event) => {

        if (new Date(event.end_registration_at) < new Date()) {
            if (registration) {
                return "Avmeldingsfrist utløpt";
            }
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

    useEffect(() => {
        setButtonText(getButtonText(event));
    }, [event, registration]);

    // all alert stuff:
    const showAlert = registration || hasUnansweredEvaluations
    const alertType = (event.paid_information && !registration?.has_paid_order && "warning")
        || (registration?.is_on_wait && "info")
        || (hasUnansweredEvaluations && "error")
        || "success";

    const getAlertMessage = () => {

        if (registration?.is_on_wait) {
            return `Du er på plass ${registration.wait_queue_number} av ${event.waiting_list_count} på ventelisten. Vi gir deg beskjed om du får plass.`;
        }

        if (hasUnansweredEvaluations && user.data?.unanswered_evaluations_count) {
            return `Du må svare på ${user.data?.unanswered_evaluations_count > 1 ? user.data?.unanswered_evaluations_count : "ett"} evalueringsskjema${user.data?.unanswered_evaluations_count > 1 ? "er" : ""} før du kan melde deg på flere arrangementer. Du finner dine ubesvarte evalueringsskjemaer under "Spørreskjemaer" på profilsiden.`;
        }

        return "Du er påmeldt arrangementet.";
    }

    const alertMessage = getAlertMessage();

    // countdown stuff:
    const countdownIsForPayment = event.paid_information && !registration?.has_paid_order;
    const countdownTime =
        (new Date(event.start_registration_at) > new Date() && new Date(event.start_registration_at))
        || ((event.paid_information && registration?.payment_expiredate && new Date(registration.payment_expiredate) > new Date()) && new Date(registration.payment_expiredate));

    const [showCountdown, setShowCountdown] = useState<boolean>();

    useEffect(() => {
        if (countdownTime) {
            setShowCountdown(true);
        }
    }, [event, registration]);

    return (
        <>
            {showAlert &&
                <Alert type={alertType} className="mx-5 mt-5">
                    <Text>
                        {showCountdown && countdownTime && countdownIsForPayment ?
                            <CountTextWrapper
                                interval={1000}
                                prefix="Du er påmeldt, men har "
                                suffix="på å betale for å beholde plassen."
                                startCount={new Date(countdownTime.getTime() - Date.now())} />
                            : alertMessage
                        }
                    </Text>
                </Alert >
            }

            {showCountdown && countdownTime && countdownIsForPayment &&
                <PaymentButton eventId={event.id} />
            }

            <Button onPress={onClick} className="mx-5 mt-5" variant={isDestructive ? "destructive" : "default"} disabled={isDisabled} >
                {mutationPending ?
                    <ActivityIndicator />
                    :
                    <>
                        {showCountdown && countdownTime && !countdownIsForPayment ?
                            <CountTextWrapper
                                interval={1000}
                                prefix="Påmeldingen åpner om "
                                suffix=""
                                startCount={new Date(countdownTime.getTime() - Date.now())}
                                onCountdownFinished={() => {
                                    setShowCountdown(false);
                                    setIsDisabled(false);
                                    setButtonText("Meld deg på arrangementet");
                                }}
                            />
                            :
                            <Text>
                                {buttonText}
                            </Text>
                        }
                    </>
                }
            </Button >
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
        <Button onPress={() => {
            if (payment.data?.payment_link) {
                WebBrowser.openBrowserAsync(payment.data.payment_link).then(() => {
                    queryClient.invalidateQueries({ queryKey: ["event"] });
                    queryClient.refetchQueries({ queryKey: ["event"] });
                })
            }
        }} className="mx-5 mt-5" variant="default" disabled={payment.isPending}>
            {payment.isPending ?
                <ActivityIndicator />
                :
                <Text>
                    Betal her
                </Text>
            }
        </Button>
    )
}


function CountTextWrapper({ interval, prefix, suffix, startCount, onCountdownFinished }: { interval: number, prefix: string, suffix: string, startCount: Date, onCountdownFinished?: () => void }) {
    const [count, setCount] = useState<Date>(startCount);

    useInterval(() => {
        setCount(new Date(count.getTime() - interval));
    }, 1000)

    useEffect(() => {
        if (count.getTime() <= 0) {
            onCountdownFinished?.();
        }
    }, [count, onCountdownFinished]);

    // Over 48 timer før nedtelling
    if (count.getTime() - 1000 * 60 * 60 * 24 * 2 > 0) {
        return (
            <Text>
                {prefix}
                {`${count.getDate()} dager`}
                {suffix}
            </Text>
        )
    }

    // 48-24 timer før nedtelling
    if (count.getTime() - 1000 * 60 * 60 * 24 > 0) {
        return (
            <Text>
                {prefix}
                {`${count.getHours() + 24} timer`}
                {suffix}
            </Text>
        )
    }

    // Under en dag før nedtelling
    return (
        <Text>
            {prefix}
            {`${count.getHours() - 1} timer, ${count.getMinutes()} minutter og ${count.getSeconds()} sekunder `}
            {suffix}
        </Text>
    )

}
