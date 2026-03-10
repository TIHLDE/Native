import { Text } from "@/components/ui/text";
import { ActivityIndicator, FlatList, Pressable, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from 'expo-camera';
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
import Toast from "react-native-toast-message";
import { getUser } from "@/actions/users/user";
import { InteropBottomSheetModal } from "@/lib/interopBottomSheet";
import { Camera, UserCheck, CircleCheck, Search, X } from "lucide-react-native";
import { useColorScheme } from "@/lib/useColorScheme";
import useDebounce from "@/lib/useDebounce";


export default function EventRegisterModal() {
    const [page, setPage] = useState(0);

    return (
        <PageWrapper className="flex-1 bg-background">
            <AnimatedPagerView titles={["QR-skann", "Manuell"]} className="w-full h-full pt-2"
                onPageChange={(i) => setPage(i)}
            >
                <View key={0} className="flex flex-1" collapsable={false}>
                    <CameraRegistration cameraDisabled={page !== 0} />
                </View>
                <View key={1} className="flex flex-1" collapsable={false}>
                    <ManualRegistration />
                </View>
            </AnimatedPagerView>
        </PageWrapper>
    );
}

function CameraRegistration({ cameraDisabled = false }: { cameraDisabled?: boolean }) {
    const [permission, requestPermission] = useCameraPermissions();
    const isFocused = useIsFocused();
    const [userToRegister, setUserToRegister] = useState<User | null>(null);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const queryClient = useQueryClient();
    const params = useLocalSearchParams<{ arrangementId: string }>();
    const eventId = Number(params.arrangementId);
    const { isDarkColorScheme } = useColorScheme();

    const updateRegistrationMutation = useMutation({
        mutationFn: async ({ newValue, userId }: { newValue: boolean, userId: string }) => {
            await updateEventParticipation(eventId, userId, newValue);
            queryClient.invalidateQueries({ queryKey: ["event", eventId, "participants"] });
            return true;
        },
        onSuccess: () => {
            setRegistrationSuccess(true);
            setTimeout(() => {
                bottomSheetModalRef.current?.dismiss();
                setRegistrationSuccess(false);
            }, 2000);
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
        return <View />;
    }

    if (!permission?.granted && permission?.canAskAgain) {
        return (
            <View className="flex-1 items-center justify-center px-8">
                <View className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-6">
                    <Camera size={36} color={isDarkColorScheme ? '#8ba3d4' : '#2d5dab'} />
                </View>
                <Text className="text-xl font-bold text-foreground text-center mb-2">
                    Kameratilgang
                </Text>
                <Text className="text-sm text-muted-foreground text-center mb-8 px-4">
                    Vi trenger tilgang til kameraet ditt for å skanne QR-koder og registrere oppmøte
                </Text>
                <Pressable
                    onPress={requestPermission}
                    className="h-14 rounded-2xl bg-primary dark:bg-[#1C5ECA] px-8 flex-row items-center justify-center active:opacity-80"
                >
                    <Camera size={18} color="white" />
                    <Text className="text-white text-base font-semibold ml-2" style={{ fontFamily: "Inter" }}>
                        Gi tilgang
                    </Text>
                </Pressable>
            </View>
        );
    }

    if (!permission?.granted && !permission?.canAskAgain) {
        return (
            <View className="flex-1 items-center justify-center px-8">
                <View className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-6">
                    <Camera size={36} color={isDarkColorScheme ? '#8ba3d4' : '#2d5dab'} />
                </View>
                <Text className="text-xl font-bold text-foreground text-center mb-2">
                    Kameratilgang kreves
                </Text>
                <Text className="text-sm text-muted-foreground text-center px-4">
                    Vi trenger tilgang til kameraet for å registrere oppmøte. Gå til innstillinger for å gi tilgang.
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 mx-2 rounded-2xl overflow-hidden">
            {isFocused &&
                <CameraView style={{ flex: 1 }} facing="back"
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"]
                    }}
                    onBarcodeScanned={async (code) => {
                        if (updateRegistrationMutation.isPending) {
                            return;
                        }

                        const user = await getUser(code.data);
                        setUserToRegister(user);
                        bottomSheetModalRef.current?.present();
                    }}
                    active={!cameraDisabled}
                >
                    <View className="absolute w-full h-full items-center justify-center">
                        <Icon icon="Scan" className="color-white opacity-80 size-72 stroke-[0.3]" />
                    </View>
                </CameraView>
            }
            <InteropBottomSheetModal
                ref={bottomSheetModalRef}
                backgroundStyleClassName="bg-primary-foreground rounded-3xl"
                enableDynamicSizing
                backdropComponent={(props) => (
                    <BottomSheetBackdrop
                        opacity={0.5}
                        appearsOnIndex={0}
                        disappearsOnIndex={-1}
                        {...props}
                    />
                )}
            >
                <BottomSheetView className="bg-primary-foreground px-6 pb-10 pt-6">
                    {registrationSuccess ? (
                        <View className="items-center py-4">
                            <View className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-4">
                                <CircleCheck size={32} color={isDarkColorScheme ? '#4ade80' : '#16a34a'} />
                            </View>
                            <Text className="text-xl font-bold text-foreground text-center">
                                Registrert!
                            </Text>
                            <Text className="text-sm text-muted-foreground text-center mt-1">
                                {userToRegister?.first_name} er registrert
                            </Text>
                        </View>
                    ) : updateRegistrationMutation.isPending ? (
                        <View className="items-center py-8">
                            <ActivityIndicator size="large" />
                            <Text className="text-sm text-muted-foreground mt-4">
                                Registrerer...
                            </Text>
                        </View>
                    ) : (
                        <>
                            <View className="items-center mb-4">
                                <View className="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mb-4">
                                    <UserCheck size={26} color={isDarkColorScheme ? '#8ba3d4' : '#2d5dab'} />
                                </View>
                                <Text className="text-xl font-bold text-foreground text-center">
                                    Registrer oppmøte
                                </Text>
                                <Text className="text-sm text-muted-foreground text-center mt-1">
                                    Vil du registrere {userToRegister?.first_name} {userToRegister?.last_name}?
                                </Text>
                            </View>
                            <View className="gap-y-2">
                                <Pressable
                                    onPress={() => {
                                        updateRegistrationMutation.mutate({ newValue: true, userId: userToRegister?.user_id ?? "" });
                                    }}
                                    className="h-14 rounded-2xl bg-primary dark:bg-[#1C5ECA] items-center justify-center active:opacity-80"
                                >
                                    <Text className="text-white text-base font-semibold" style={{ fontFamily: "Inter" }}>
                                        Registrer
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => bottomSheetModalRef.current?.dismiss()}
                                    className="h-12 rounded-2xl bg-gray-100 dark:bg-secondary/30 items-center justify-center active:bg-gray-200 dark:active:bg-secondary/50"
                                >
                                    <Text className="text-base font-medium text-foreground" style={{ fontFamily: "Inter" }}>
                                        Avbryt
                                    </Text>
                                </Pressable>
                            </View>
                        </>
                    )}
                </BottomSheetView>
            </InteropBottomSheetModal>
        </View>
    );
}

function ManualRegistration() {
    const params = useLocalSearchParams<{ arrangementId: string }>();
    const id = Number(params.arrangementId);
    const { isDarkColorScheme } = useColorScheme();
    const [searchText, setSearchText] = useState('');
    const debouncedSearch = useDebounce(searchText, 500);

    const mutedColor = isDarkColorScheme ? '#9ca3af' : '#6b7280';

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isPending,
        isFetchingNextPage,
        isFetching,
        isError,
    } = useInfiniteQuery({
        queryKey: ["event", id, "participants", debouncedSearch],
        queryFn: async ({ pageParam }) => await eventParticipants(id, pageParam, debouncedSearch || undefined),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.next === null) return undefined;
            return lastPageParam + 1;
        },
    });

    const participants = data?.pages.flatMap((page) => {
        if (!page) return [];
        return page.results.filter((registration) => !registration.is_on_wait);
    }) ?? [];

    return (
        <FlatList
            className="h-full"
            data={participants}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            keyboardDismissMode="on-drag"
            ListHeaderComponent={
                <View className="pt-1 pb-2">
                    <View className="flex-row items-center bg-gray-100 dark:bg-secondary/30 rounded-2xl px-4 h-12">
                        <Search size={18} color={mutedColor} />
                        <TextInput
                            className="flex-1 ml-3 text-foreground"
                            placeholder="Søk etter deltaker..."
                            placeholderTextColor={mutedColor}
                            value={searchText}
                            onChangeText={setSearchText}
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={{ fontFamily: "Inter", fontSize: 16, lineHeight: 20, paddingTop: 0, paddingBottom: 0 }}
                        />
                        {searchText.length > 0 && (
                            <Pressable onPress={() => setSearchText('')} className="p-1">
                                <X size={16} color={mutedColor} />
                            </Pressable>
                        )}
                        {isFetching && !isPending && (
                            <ActivityIndicator size="small" className="ml-2" />
                        )}
                    </View>
                </View>
            }
            renderItem={({ item, index }) => (
                <>
                    <EventRegistration registration={item} eventId={id} />
                    {index < participants.length - 1 && (
                        <View className="h-px bg-border dark:bg-muted" />
                    )}
                </>
            )}
            keyExtractor={(item) => item.registration_id.toString()}
            onEndReached={() => {
                if (!hasNextPage) return;
                fetchNextPage();
            }}
            ListEmptyComponent={
                isPending ? (
                    <View className="py-16 items-center">
                        <ActivityIndicator size="large" />
                    </View>
                ) : isError ? (
                    <View className="py-16 items-center">
                        <Text className="text-base text-muted-foreground text-center">Noe gikk galt</Text>
                    </View>
                ) : (
                    <View className="py-16 items-center">
                        <Text className="text-muted-foreground text-center">
                            {debouncedSearch ? 'Ingen deltakere matcher søket' : 'Ingen påmeldte deltakere'}
                        </Text>
                    </View>
                )
            }
            ListFooterComponent={
                isFetchingNextPage ? (
                    <View className="py-6">
                        <ActivityIndicator />
                    </View>
                ) : null
            }
        />
    );
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
            queryClient.invalidateQueries({ queryKey: ["event", eventId, "participants"] });
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
    };

    const handlePress = async () => {
        if (updateRegistrationMutation.isPending) return;
        await updateRegistrationMutation.mutateAsync(!checked);
        setChecked(!checked);
    };

    const initials = `${registration.user_info.first_name[0]}${registration.user_info.last_name[0]}`;

    return (
        <Pressable
            onPress={handlePress}
            disabled={updateRegistrationMutation.isPending}
            className="flex-row items-center py-3.5 active:opacity-70"
        >
            <View className="w-10 h-10 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center mr-3">
                <Text className="text-sm font-bold text-primary dark:text-accent">
                    {initials}
                </Text>
            </View>
            <Text className="flex-1 text-base text-foreground" style={{ fontFamily: "Inter" }}>
                {registration.user_info.first_name} {registration.user_info.last_name}
            </Text>
            <Switch
                disabled={updateRegistrationMutation.isPending}
                checked={checked}
                onCheckedChange={handleCheckedChange}
                nativeID={`switch-${registration.registration_id}`}
            />
        </Pressable>
    );
}
