import { Text } from "@/components/ui/text";
import { ActivityIndicator, FlatList, View } from "react-native";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button } from "@/components/ui/button";
import { useIsFocused } from "@react-navigation/native";
import PageWrapper from "@/components/ui/pagewrapper";
import AnimatedPagerView from "@/components/ui/AnimatedPagerView";
import { useEffect, useRef, useState } from "react";
import Icon from "@/lib/icons/Icon";
import { useLocalSearchParams } from "expo-router";
import { Registration, User } from "@/actions/types";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventParticipants, updateEventParticipation } from "@/actions/events/participants";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Toast from "react-native-toast-message";
import { getUser } from "@/actions/users/user";
import { InteropBottomSheetModal } from "@/lib/interopBottomSheet";


export default function EventRegisterModal() {
    const [page, setPage] = useState(0);

    return (
        <PageWrapper>
            <View className="flex flex-col gap-4 p-4">
                <AnimatedPagerView titles={["QR", "Manuell registrering"]} className="w-full h-full"
                    onPageChange={(i) => setPage(i)}
                >
                    <View key={0} className="flex flex-1" collapsable={false}>
                        <CameraRegistration cameraDisabled={page !== 0} />
                    </View>
                    <View key={1} className="flex flex-1" collapsable={false}>
                        <ManualRegistration />
                    </View>
                </AnimatedPagerView>
            </View>
        </PageWrapper>
    )

}

function CameraRegistration({ cameraDisabled = false }: { cameraDisabled?: boolean }) {
    const [permission, requestPermission] = useCameraPermissions();
    const isFocused = useIsFocused();
    const [userToRegister, setUserToRegister] = useState<User | null>(null);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const queryClient = useQueryClient();
    const eventId = Number(useLocalSearchParams().eventId);

    const updateRegistrationMutation = useMutation({
        mutationFn: async ({ newValue, userId }: { newValue: boolean, userId: string }) => {
            await updateEventParticipation(eventId, userId, newValue);
            queryClient.invalidateQueries({ queryKey: ["event", "participants"] });
            return true;
        },
        onSuccess: () => {
            Toast.show({
                type: "success",
                text1: `${userToRegister?.first_name} er registrert`,
            });
            bottomSheetModalRef.current?.dismiss();
        },
        onError: (error) => {
            bottomSheetModalRef.current?.dismiss();
            if (error.message === "Not found.") {
                Toast.show({
                    type: "error",
                    text1: "Feil",
                    text2: `${userToRegister?.first_name} er ikke påmeldt arrangementet`,
                });
                return;
            }

            Toast.show({
                type: "error",
                text1: "Feil",
                text2: error.message,
            });
        }
    });

    if (!permission) {
        return <View />
    }

    if (!permission?.granted && permission?.canAskAgain) {
        return (
            <View className="p-4 flex flex-col items-center m-auto gap-8">
                <Text className="text-center text-xl">Vi trenger tilgang til kamera for å registrere oppmøte</Text>
                <Button variant="default" className="w-52" onPress={requestPermission}>
                    <Text>
                        Gi tilgang
                    </Text>
                </Button>
            </View>
        )
    }

    if (!permission?.granted && !permission?.canAskAgain) {
        return (
            <View className="p-4 flex flex-col items-center m-auto gap-8">
                <Text className="text-center text-xl">Vi trenger tilgang til kamera for å registrere oppmøte. Gå til innstillinger for å gi tilgang.
                </Text>
            </View>
        )
    }

    return (
        <View className="m-auto w-full h-full">
            {isFocused &&
                <CameraView style={{ flex: 1 }} facing="back"
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"]
                    }}
                    onBarcodeScanned={async (code) => {

                        if (updateRegistrationMutation.isPending) {
                            return
                        };

                        const user = await getUser(code.data);
                        setUserToRegister(user);
                        bottomSheetModalRef.current?.present();
                    }}
                    active={!cameraDisabled}
                >
                    <View className="absolute w-full h-full">
                        <Icon icon="Scan" className="m-auto color-white opacity-80 size-40 stroke-[0.5]" />
                    </View>
                </CameraView>
            }
            <InteropBottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={["25%"]}
                enableDynamicSizing={false}
                backgroundStyleClassName="rounded-3xl"
                backdropComponent={(props) => (
                    <BottomSheetBackdrop
                        opacity={0.1}
                        appearsOnIndex={0}
                        disappearsOnIndex={-1}
                        {...props}
                    />
                )} >
                <BottomSheetView className="mx-auto mt-5">
                    <View className="p-4 flex flex-col gap-4">
                        <Text className="text-lg">Er du sikker på at du vil registrere {userToRegister?.first_name}? </Text>
                        <Button variant="default" onPress={() => {
                            updateRegistrationMutation.mutate({ newValue: true, userId: userToRegister?.user_id ?? "" });
                        }}>
                            {updateRegistrationMutation.isPending
                                ? <ActivityIndicator />
                                : <Text>Registrer</Text>
                            }
                        </Button>
                    </View>
                </BottomSheetView>
            </InteropBottomSheetModal>
        </View>
    )
}

function ManualRegistration() {
    const params = useLocalSearchParams();
    const id = Number(params.eventId);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isPending,
        isFetchingNextPage,
        isError,
    } = useInfiniteQuery({
        queryKey: ["event", "participants"],
        queryFn: async ({ pageParam }) => {
            return await eventParticipants(id, pageParam);
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (!lastPage || lastPage.length === 0) {
                return undefined;
            }
            return lastPageParam + 1;
        },
    });

    if (isPending) {
        return (
            <ActivityIndicator />
        )
    }

    if (isError) {
        return (
            <Text className="text-center mt-4 text-muted-foreground">Noe gikk galt</Text>
        )
    }

    return (
        <FlatList className="h-full" data={data.pages.flatMap((page) => {
            if (!page) {
                return [];
            }
            return page.filter((registration) => {
                if (registration.is_on_wait) {
                    return null;
                }
                return registration;
            });
        })}

            renderItem={({ item }) => {
                return (
                    <EventRegistration registration={item} eventId={id} />
                )
            }
            }
            onEndReached={() => {
                if (!hasNextPage) {
                    return;
                }

                fetchNextPage();
            }}
            ListFooterComponent={(
                <View className="m-auto mt-4">
                    {isFetchingNextPage && <ActivityIndicator />}
                    {!hasNextPage && <Text className="text-center mt-4 text-muted-foreground">Ingen{data.pages[0] && data.pages[0].length > 0 && " flere"} påmeldte</Text>}
                </View>
            )}
        />
    )

}

function EventRegistration({ registration, eventId }: { registration: Registration, eventId: number }) {
    const [checked, setChecked] = useState(registration.has_attended);
    const queryClient = useQueryClient();

    useEffect(() => {
        setChecked(registration.has_attended);
    }, [registration.has_attended]);

    const updateRegistrationMutation = useMutation({
        mutationFn: async (newValue: boolean) => {
            await updateEventParticipation(eventId, registration.user_info.user_id, newValue);
            queryClient.invalidateQueries({ queryKey: ["event", "participants"] });
            return true;
        },
        onError: (error) => {
            Toast.show({
                type: "error",
                text1: "Feil",
                text2: error.message,
            });
            setChecked(registration.has_attended);
        }
    });

    const handleCheckedChange = (newValue: boolean) => {
        updateRegistrationMutation.mutate(newValue);
        setChecked(newValue);
    }

    return (
        <View className="flex flex-row items-center justify-between gap-4 p-2 w-1/2 m-auto">
            <Label className="text-xl" nativeID={`label-${registration.registration_id}`}>{registration.user_info.first_name}</Label>
            <Switch checked={checked} onCheckedChange={handleCheckedChange} nativeID={`switch-${registration.registration_id}`} />
        </View>
    )

}