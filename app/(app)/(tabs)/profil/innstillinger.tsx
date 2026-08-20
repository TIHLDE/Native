import type { NotificationChannel, UserSettings } from "@/actions/types";
import {
    mySettings,
    settingsKeys,
    updateMySettings,
} from "@/actions/users/settings";
import { ThemeSwitch } from "@/components/themeToggle";
import PageWrapper, { TAB_SCREEN_EDGES, TAB_BAR_CLEARANCE } from "@/components/ui/pagewrapper";
import { SectionHeader } from "@/components/ui/section-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { InteropBottomSheetModal } from "@/lib/interopBottomSheet";
import { isPushEnabled, setPushEnabled } from "@/lib/notifications/push";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import useRefresh from "@/lib/useRefresh";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
    ChevronRight,
    LogOut,
    TriangleAlert,
} from "lucide-react-native";
import { useRef } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

/** Rekkefølgen i bryteren, og etikettene som vises. */
const CHANNELS: { value: NotificationChannel; label: string }[] = [
    { value: "none", label: "Ingen" },
    { value: "email", label: "E-post" },
    { value: "push", label: "Telefon" },
    { value: "both", label: "Begge" },
];

const pushQueryKey = ["notifications", "push-enabled"];

/** De to underliggende bryterne som ett valg. */
function toChannel(mail: boolean, push: boolean): NotificationChannel {
    if (mail && push) return "both";
    if (mail) return "email";
    if (push) return "push";
    return "none";
}

export default function Innstillinger() {
    const { signOut } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isDarkColorScheme } = useColorScheme();
    const logoutSheetRef = useRef<BottomSheetModal>(null);

    const settings = useQuery({
        queryKey: settingsKeys.mine,
        queryFn: mySettings,
    });

    const pushEnabled = useQuery({
        queryKey: pushQueryKey,
        queryFn: isPushEnabled,
    });

    const refreshControl = useRefresh([settingsKeys.mine, pushQueryKey]);

    /**
     * Bryterne leser verdien fra spørringen, ikke fra egen tilstand. Uten det
     * optimistiske hoppet ville de stått igjen på gammel verdi til Photon
     * svarte, som ser ut som at trykket ikke ble registrert.
     */
    const update = useMutation({
        mutationFn: (updates: Partial<UserSettings>) => updateMySettings(updates),
        onMutate: async (updates) => {
            await queryClient.cancelQueries({ queryKey: settingsKeys.mine });
            const previous = queryClient.getQueryData<UserSettings>(settingsKeys.mine);

            if (previous) {
                queryClient.setQueryData<UserSettings>(settingsKeys.mine, {
                    ...previous,
                    ...updates,
                });
            }

            return { previous };
        },
        onError: (error, _updates, context) => {
            if (context?.previous) {
                queryClient.setQueryData(settingsKeys.mine, context.previous);
            }
            Toast.show({
                type: "error",
                text1: "Innstillingen ble ikke lagret",
                text2: error.message,
            });
        },
        onSuccess: (updated) => {
            queryClient.setQueryData(settingsKeys.mine, updated);
        },
    });

    /**
     * E-post er en innstilling i Photon, push er om telefonen er meldt på.
     * Bryteren setter begge i én handling, så brukeren slipper å vite det.
     *
     * Push først: går den ikke gjennom, står e-posten urørt. Ellers ville
     * «Telefon» endt som «Ingen» — valget slo av e-posten og fikk aldri på
     * push — og skjermen hoppet til noe brukeren ikke hadde bedt om.
     */
    const changeChannel = useMutation({
        mutationFn: async (channel: NotificationChannel) => {
            const wantsMail = channel === "email" || channel === "both";
            const wantsPush = channel === "push" || channel === "both";

            if (wantsPush !== (pushEnabled.data ?? true)) {
                const result = await setPushEnabled(wantsPush);
                queryClient.setQueryData(pushQueryKey, wantsPush && result === "ok");
                if (result !== "ok") return result;
            }

            if (wantsMail !== (settings.data?.receiveMailCommunication ?? true)) {
                const updated = await updateMySettings({
                    receiveMailCommunication: wantsMail,
                });
                queryClient.setQueryData(settingsKeys.mine, updated);
            }

            return "ok" as const;
        },
        onSuccess: (result) => {
            if (result === "denied") {
                Toast.show({
                    type: "error",
                    text1: "Varsler er avslått",
                    text2: "Skru på varsler for TIHLDE i innstillingene på telefonen.",
                });
            }

            // Uten denne ser «Telefon» og «Begge» ut som knapper som ikke
            // virker: valget spretter tilbake, og ingenting sier hvorfor.
            if (result === "unavailable") {
                Toast.show({
                    type: "error",
                    text1: "Push-varsler er ikke tilgjengelig her",
                    text2: "Denne enheten kan ikke motta push. Prøv på en fysisk telefon.",
                });
            }
        },
        onError: (error) => {
            Toast.show({
                type: "error",
                text1: "Innstillingen ble ikke lagret",
                text2: error.message,
            });
        },
    });

    if (settings.isPending) {
        return (
            <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" />
                </View>
            </PageWrapper>
        );
    }

    if (settings.isError) {
        return (
            <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-base text-destructive text-center">
                        {settings.error.message}
                    </Text>
                    <Pressable
                        onPress={() => settings.refetch()}
                        className="mt-6 h-12 px-6 rounded-2xl items-center justify-center bg-primary active:opacity-80"
                    >
                        <Text className="text-white text-base font-semibold">
                            Prøv igjen
                        </Text>
                    </Pressable>
                </View>
            </PageWrapper>
        );
    }

    const current = settings.data;
    const channel = toChannel(
        current.receiveMailCommunication,
        pushEnabled.data ?? true,
    );
    const channelIndex = CHANNELS.findIndex((option) => option.value === channel);

    const allergyCount = current.allergies.length;

    const handleLogoutConfirm = async () => {
        logoutSheetRef.current?.dismiss();
        await signOut?.();
        router.replace("/(auth)/login");
    };

    return (
        <PageWrapper className="flex-1 bg-background" edges={TAB_SCREEN_EDGES}>
            <ScrollView
                refreshControl={refreshControl}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE }}
            >
                {/* Utseende */}
                <View className="px-5 pt-5">
                    <SectionHeader title="Utseende" />
                    <ThemeSwitch />
                </View>

                {/* Arrangementer */}
                <View className="px-5 pt-6">
                    <SectionHeader title="Arrangementer" />

                    {!current.acceptsEventRules ? (
                        <View className="flex-row items-start bg-destructive/10 dark:bg-destructive/20 rounded-2xl px-4 py-3.5 mb-3">
                            <TriangleAlert
                                size={18}
                                color={themeColors(isDarkColorScheme).destructive}
                            />
                            <Text className="flex-1 text-sm text-destructive ml-3">
                                Du må godta arrangementsreglene før du kan melde deg på
                                arrangementer.
                            </Text>
                        </View>
                    ) : null}

                    <SettingGroup>
                        <SwitchRow
                            title="Arrangementsregler"
                            description="Jeg har lest og godtar TIHLDEs regler for arrangementer."
                            checked={current.acceptsEventRules}
                            disabled={update.isPending}
                            onCheckedChange={(value) =>
                                update.mutate({ acceptsEventRules: value })
                            }
                            nativeID="accepts-event-rules"
                        />
                        <RowDivider />
                        <LinkRow
                            title="Allergier"
                            description={
                                allergyCount === 0
                                    ? "Ingen registrert"
                                    : `${allergyCount} registrert`
                            }
                            onPress={() => router.push("/(app)/(tabs)/profil/allergier")}
                        />
                    </SettingGroup>
                </View>

                {/* Personvern */}
                <View className="px-5 pt-6">
                    <SectionHeader title="Personvern" />
                    <SettingGroup>
                        <SwitchRow
                            title="Bildesamtykke"
                            description="Bilder av deg fra arrangementer kan publiseres. Gjelder arrangementer du melder deg på etter at du endrer dette."
                            checked={current.allowsPhotosByDefault}
                            disabled={update.isPending}
                            onCheckedChange={(value) =>
                                update.mutate({ allowsPhotosByDefault: value })
                            }
                            nativeID="allows-photos"
                        />
                        <RowDivider />
                        <SwitchRow
                            title="Offentlige påmeldinger"
                            description="Navnet ditt vises i deltakerlister. Skrur du av, står du oppført som anonym for andre medlemmer. Arrangører ser deg uansett."
                            checked={current.publicEventRegistrations}
                            disabled={update.isPending}
                            onCheckedChange={(value) =>
                                update.mutate({ publicEventRegistrations: value })
                            }
                            nativeID="public-registrations"
                        />
                    </SettingGroup>
                </View>

                {/* Varsler */}
                <View className="px-5 pt-6">
                    <SectionHeader title="Varsler" />
                    <SegmentedControl
                        options={CHANNELS.map((option) => option.label)}
                        value={channelIndex === -1 ? 0 : channelIndex}
                        onChange={(index) =>
                            changeChannel.mutate(CHANNELS[index].value)
                        }
                    />
                    <Text className="text-sm text-muted-foreground mt-2.5">
                        Hvor du vil høre fra TIHLDE. «Telefon» er push-varsler på denne
                        telefonen.
                    </Text>
                </View>

                {/* Logg ut */}
                <View className="px-5 pt-8">
                    <Pressable
                        onPress={() => logoutSheetRef.current?.present()}
                        className="flex-row items-center justify-center h-14 rounded-2xl bg-destructive/10 dark:bg-destructive/20 active:opacity-70"
                    >
                        <LogOut
                            size={18}
                            color={themeColors(isDarkColorScheme).destructive}
                        />
                        <Text className="text-base font-semibold text-destructive ml-2">
                            Logg ut
                        </Text>
                    </Pressable>
                </View>

                <InteropBottomSheetModal
                    ref={logoutSheetRef}
                    backgroundStyleClassName="bg-popover rounded-3xl"
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
                    <BottomSheetView className="bg-popover px-6 pb-10 pt-6">
                        <View className="items-center mb-4">
                            <View className="w-14 h-14 rounded-full bg-destructive/10 dark:bg-destructive/20 items-center justify-center mb-4">
                                <TriangleAlert
                                    size={26}
                                    color={themeColors(isDarkColorScheme).destructive}
                                />
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
                                <Text className="text-white text-base font-semibold">
                                    Logg ut
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => logoutSheetRef.current?.dismiss()}
                                className="h-12 rounded-2xl bg-gray-100 dark:bg-secondary/30 items-center justify-center active:bg-gray-200 dark:active:bg-secondary/50"
                            >
                                <Text className="text-base font-medium text-foreground">
                                    Avbryt
                                </Text>
                            </Pressable>
                        </View>
                    </BottomSheetView>
                </InteropBottomSheetModal>
            </ScrollView>
        </PageWrapper>
    );
}

function SettingGroup({ children }: { children: React.ReactNode }) {
    return (
        <View className="bg-gray-100 dark:bg-secondary/30 rounded-2xl overflow-hidden">
            {children}
        </View>
    );
}

function RowDivider() {
    return <View className="h-px bg-border dark:bg-muted mx-4" />;
}

function SwitchRow({
    title,
    description,
    checked,
    disabled,
    onCheckedChange,
    nativeID,
}: {
    title: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onCheckedChange: (value: boolean) => void;
    nativeID: string;
}) {
    return (
        <View className="flex-row items-center px-4 py-3.5">
            <View className="flex-1 mr-4">
                <Text className="text-base text-foreground">{title}</Text>
                <Text className="text-sm text-muted-foreground mt-0.5">
                    {description}
                </Text>
            </View>
            <Switch
                checked={checked}
                disabled={disabled}
                onCheckedChange={onCheckedChange}
                nativeID={nativeID}
            />
        </View>
    );
}

function LinkRow({
    title,
    description,
    onPress,
}: {
    title: string;
    description: string;
    onPress: () => void;
}) {
    const { isDarkColorScheme } = useColorScheme();

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            className="flex-row items-center px-4 py-3.5 active:opacity-70"
        >
            <View className="flex-1 mr-4">
                <Text className="text-base text-foreground">{title}</Text>
                <Text className="text-sm text-muted-foreground mt-0.5">
                    {description}
                </Text>
            </View>
            <ChevronRight
                size={20}
                color={themeColors(isDarkColorScheme).mutedForeground}
            />
        </Pressable>
    );
}
