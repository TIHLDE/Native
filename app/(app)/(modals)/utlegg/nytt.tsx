import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import {
    Calendar,
    Camera,
    Check,
    CheckCircle,
    ChevronDown,
    FileText,
    ImagePlus,
    TriangleAlert,
    X,
} from "lucide-react-native";
import me from "@/actions/users/me";
import {
    applicationOptions,
    createExpense,
} from "@/actions/applications/applications";
import { uploadReceipt } from "@/actions/applications/upload";
import PageWrapper from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import { SectionHeader } from "@/components/ui/section-header";
import { useColorScheme } from "@/lib/useColorScheme";
import { themeColors, type ThemeColors } from "@/lib/theme/colors";
import type { BudgetType } from "@/actions/types";

/** En valgt kvittering. `key` settes først når fila er lastet opp. */
type Receipt = {
    uri: string;
    /** PDF-er har ingen forhåndsvisning, så de vises som et ikon i stedet. */
    isPdf: boolean;
    key: string | null;
};

const ACCOUNT_PATTERN = /^\d{4}\.\d{2}\.\d{5}$/;
// Bevisst romslig: e-post skal avvises bare når den åpenbart ikke kan
// leveres til. Photon eier den endelige valideringen.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTACHMENTS = 10;

/** Photon vil ha `YYYY-MM-DD`; `toISOString` ville gitt gårsdagen før kl. 01 om vinteren. */
function toIsoDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

/** `new Date("2026-08-14")` tolkes som UTC og kan bomme med en dag lokalt. */
function fromIsoDate(iso: string): Date {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year, month - 1, day);
}

/** Datoen slik den vises i feltet, f.eks. «14. august 2026». */
function formatDateLabel(iso: string): string {
    return fromIsoDate(iso).toLocaleDateString("no-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

/** Legger `top` med gitt alpha over `bottom` og gir en ugjennomsiktig hex. */
function blend(top: string, bottom: string, alpha: number): string {
    const channels = (hex: string) =>
        [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const [tr, tg, tb] = channels(top);
    const [br, bg, bb] = channels(bottom);
    const mix = (t: number, b: number) =>
        Math.round(t * alpha + b * (1 - alpha))
            .toString(16)
            .padStart(2, "0");
    return `#${mix(tr, br)}${mix(tg, bg)}${mix(tb, bb)}`;
}

/**
 * Feltbakgrunnen som en ugjennomsiktig farge.
 *
 * Feltene bruker ellers `bg-secondary/30`, men datofeltet må dekke over
 * pillen til den native datovelgeren — og en halvgjennomsiktig bakgrunn ville
 * latt den skinne gjennom. Lys modus bruker `bg-gray-100`, som allerede er tett.
 */
function solidFieldColor(colors: ThemeColors, isDark: boolean): string {
    return isDark ? blend(colors.secondary, colors.background, 0.3) : "#f3f4f6";
}

/** Formaterer kontonummer til xxxx.xx.xxxxx mens det skrives. */
function formatAccountNumber(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}.${digits.slice(4)}`;
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
}

export default function NyttUtlegg() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isDarkColorScheme } = useColorScheme();
    const colors = themeColors(isDarkColorScheme);

    const user = useQuery({ queryKey: ["users", "me"], queryFn: me });
    const options = useQuery({
        queryKey: ["applications", "options"],
        queryFn: applicationOptions,
    });

    const [contactName, setContactName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [ccEmail, setCcEmail] = useState<string | null>(null);
    const [amount, setAmount] = useState("");
    const [expenseDate, setExpenseDate] = useState(() => toIsoDate(new Date()));
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [groupSlug, setGroupSlug] = useState<string | null>(null);
    const [budgetType, setBudgetType] = useState<BudgetType | null>(null);
    const [description, setDescription] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [openPicker, setOpenPicker] = useState<
        "group" | "budget" | "cc" | null
    >(null);
    const [isSuccess, setIsSuccess] = useState(false);
    // Vises rett over send-knappen. En toast legger seg bak den ugjennomsiktige
    // headeren på denne skjermen, og feilen ville blitt usynlig.
    const [formError, setFormError] = useState<string | null>(null);

    // Kontaktfeltene er nesten alltid innsenderen selv, så de fylles ut på
    // forhånd — men de kan overstyres, siden pengene ikke alltid skal til den
    // som sender inn.
    useEffect(() => {
        if (!user.data) return;
        setContactName((current) =>
            current || `${user.data.first_name} ${user.data.last_name}`.trim(),
        );
        setContactEmail((current) => current || user.data.email);
    }, [user.data]);

    const addReceipts = (
        assets: { uri: string; mimeType?: string | null; fileName?: string | null }[],
    ) => {
        setReceipts((current) => {
            const room = MAX_ATTACHMENTS - current.length;
            if (room <= 0) {
                Toast.show({
                    type: "error",
                    text1: "For mange kvitteringer",
                    text2: `Du kan legge ved maks ${MAX_ATTACHMENTS}.`,
                });
                return current;
            }
            const added = assets.slice(0, room).map((asset) => ({
                uri: asset.uri,
                isPdf:
                    asset.mimeType === "application/pdf" ||
                    (asset.fileName ?? asset.uri).toLowerCase().endsWith(".pdf"),
                key: null,
            }));
            return [...current, ...added];
        });
    };

    const pickFromLibrary = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true,
            selectionLimit: MAX_ATTACHMENTS - receipts.length,
            quality: 0.8,
        });
        if (!result.canceled) addReceipts(result.assets);
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Toast.show({
                type: "error",
                text1: "Tilgang nektet",
                text2: "Du må gi tilgang til kameraet for å ta bilde av kvitteringen.",
            });
            return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        if (!result.canceled) addReceipts(result.assets);
    };

    const removeReceipt = (index: number) =>
        setReceipts((current) => current.filter((_, i) => i !== index));

    /** Første feilmelding, eller null når skjemaet kan sendes. */
    const validate = (): string | null => {
        if (!contactName.trim()) return "Fyll inn navn.";
        if (!EMAIL_PATTERN.test(contactEmail.trim()))
            return "Fyll inn en gyldig e-post.";
        const parsedAmount = Number(amount);
        if (!Number.isInteger(parsedAmount) || parsedAmount <= 0)
            return "Beløpet må være et helt antall kroner over 0.";
        if (parsedAmount > 1_000_000) return "Beløpet kan ikke overstige 1 000 000 kr.";
        if (!groupSlug) return "Velg hvilken gruppe utlegget gjelder.";
        if (!budgetType) return "Velg budsjett.";
        if (!description.trim()) return "Beskriv hva utlegget gjelder.";
        if (!ACCOUNT_PATTERN.test(accountNumber))
            return "Kontonummer må ha 11 siffer (xxxx.xx.xxxxx).";
        if (receipts.length === 0) return "Legg ved minst én kvittering.";
        return null;
    };

    const submit = useMutation({
        mutationFn: async () => {
            // Nøklene beholdes på kvitteringene: feiler selve søknaden på noe
            // annet, slipper vi å laste opp de samme filene på nytt.
            const uploaded: Receipt[] = [];
            for (const receipt of receipts) {
                uploaded.push(
                    receipt.key
                        ? receipt
                        : { ...receipt, key: await uploadReceipt(receipt.uri) },
                );
            }
            setReceipts(uploaded);

            return createExpense({
                contactName: contactName.trim(),
                contactEmail: contactEmail.trim(),
                ...(ccEmail ? { ccEmail } : {}),
                amountNok: Number(amount),
                expenseDate,
                groupSlug: groupSlug!,
                budgetType: budgetType!,
                description: description.trim(),
                accountNumber,
                attachmentKeys: uploaded.map((receipt) => receipt.key!),
            });
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({
                queryKey: ["applications", "mine", "expense"],
            });
            if (!result.pdfGenerated) {
                // Utlegget ER sendt inn; bare PDF-en manglet. Det skal ikke se
                // ut som en feil, men økonomiansvarlig bør vite det.
                Toast.show({
                    type: "info",
                    text1: "Utlegget er sendt inn",
                    text2: "PDF-en ble ikke generert. Si fra til økonomiansvarlig.",
                });
            }
            setIsSuccess(true);
        },
        onError: (error: Error) => {
            setFormError(error.message);
            Toast.show({
                type: "error",
                text1: "Kunne ikke sende inn",
                text2: error.message,
            });
        },
    });

    const handleSubmit = () => {
        const problem = validate();
        setFormError(problem);
        if (problem) return;
        submit.mutate();
    };

    if (isSuccess) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <View className="flex-1 items-center justify-center px-8">
                    <View className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/20 items-center justify-center mb-6">
                        <CheckCircle size={40} color="#16a34a" />
                    </View>
                    <Text className="text-2xl font-bold text-foreground text-center">
                        Utlegget er sendt inn
                    </Text>
                    <Text className="text-base text-muted-foreground text-center mt-2">
                        Du får beskjed når det er behandlet.
                    </Text>
                    <Pressable
                        onPress={() => router.back()}
                        className="h-14 px-8 rounded-2xl bg-primary items-center justify-center mt-8 active:opacity-80"
                    >
                        <Text
                            className="text-base font-semibold text-white"
                            style={{ fontFamily: "Inter" }}
                        >
                            Tilbake til utlegg
                        </Text>
                    </Pressable>
                </View>
            </PageWrapper>
        );
    }

    const inputClass =
        "h-12 rounded-xl bg-gray-100 dark:bg-secondary/30 px-4 text-base text-foreground";

    const selectedGroup = options.data?.groups.find((g) => g.slug === groupSlug);
    const selectedBudget = options.data?.budgetTypes.find(
        (b) => b.value === budgetType,
    );
    const selectedCc = options.data?.ccOptions.find((c) => c.email === ccEmail);

    return (
        <PageWrapper className="flex-1 bg-background">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
                >
                    {/* Kvitteringer først: det er dem man har telefonen framme for. */}
                    <SectionHeader title="Kvitteringer" />
                    <View className="flex-row gap-x-3 mb-3">
                        <Pressable
                            onPress={takePhoto}
                            className="flex-1 flex-row items-center justify-center h-14 rounded-2xl bg-primary active:opacity-80"
                        >
                            <Camera size={20} color="#ffffff" />
                            <Text
                                className="text-base font-semibold text-white ml-2"
                                style={{ fontFamily: "Inter" }}
                            >
                                Ta bilde
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={pickFromLibrary}
                            className="flex-1 flex-row items-center justify-center h-14 rounded-2xl bg-gray-100 dark:bg-secondary/30 active:opacity-70"
                        >
                            <ImagePlus size={20} color={colors.foreground} />
                            <Text className="text-base font-semibold text-foreground ml-2">
                                Velg fil
                            </Text>
                        </Pressable>
                    </View>

                    {receipts.length > 0 && (
                        <View className="flex-row flex-wrap gap-3 mb-2">
                            {receipts.map((receipt, index) => (
                                <View key={`${receipt.uri}-${index}`} className="relative">
                                    {receipt.isPdf ? (
                                        <View className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-secondary/30 items-center justify-center">
                                            <FileText size={28} color={colors.mutedForeground} />
                                        </View>
                                    ) : (
                                        <Image
                                            source={{ uri: receipt.uri }}
                                            className="w-24 h-24 rounded-xl"
                                        />
                                    )}
                                    <Pressable
                                        onPress={() => removeReceipt(index)}
                                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive items-center justify-center"
                                    >
                                        <X size={16} color="#ffffff" />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}
                    <Text className="text-xs text-muted-foreground mb-6">
                        Minst én kvittering, maks {MAX_ATTACHMENTS}. Bilde eller PDF.
                    </Text>

                    <SectionHeader title="Utlegget" />
                    <View className="gap-y-3 mb-6">
                        {/* Beløp og dato er begge korte verdier, så de deler rad. */}
                        <View className="flex-row gap-x-3">
                            <View className="flex-1">
                                <Text className="text-sm text-muted-foreground mb-1.5">
                                    Beløp (kr)
                                </Text>
                                <TextInput
                                    value={amount}
                                    onChangeText={(text) => setAmount(text.replace(/\D/g, ""))}
                                    keyboardType="number-pad"
                                    // 1 000 000 er taket, så sju siffer er alt som trengs.
                                    maxLength={7}
                                    placeholder="0"
                                    placeholderTextColor={colors.mutedForeground}
                                    className={inputClass}
                                />
                            </View>

                            <View className="flex-1">
                                <Text className="text-sm text-muted-foreground mb-1.5">
                                    Dato for kjøpet
                                </Text>
                                {Platform.OS === "ios" ? (
                                    // Kontrollen ligger under, og raden tegnes oppå som et
                                    // ugjennomsiktig lokk: pillen dens lar seg ikke style
                                    // bort, så den skjules i stedet. Lokket tar ikke imot
                                    // trykk, så de går rett gjennom til kontrollen.
                                    <View className="h-12 justify-center overflow-hidden rounded-xl">
                                        <DateTimePicker
                                            value={fromIsoDate(expenseDate)}
                                            mode="date"
                                            display="compact"
                                            locale="nb-NO"
                                            maximumDate={new Date()}
                                            themeVariant={isDarkColorScheme ? "dark" : "light"}
                                            onChange={(_event, date) => {
                                                if (date) setExpenseDate(toIsoDate(date));
                                            }}
                                        />
                                        <View
                                            pointerEvents="none"
                                            style={{
                                                ...StyleSheet.absoluteFillObject,
                                                backgroundColor: solidFieldColor(
                                                    colors,
                                                    isDarkColorScheme,
                                                ),
                                            }}
                                            className="flex-row items-center justify-between rounded-xl px-3"
                                        >
                                            <Text
                                                className="text-base text-foreground"
                                                numberOfLines={1}
                                            >
                                                {formatDateLabel(expenseDate)}
                                            </Text>
                                            <Calendar
                                                size={18}
                                                color={colors.mutedForeground}
                                            />
                                        </View>
                                    </View>
                                ) : (
                                    <Pressable
                                        onPress={() => {
                                            setOpenPicker(null);
                                            setIsDatePickerOpen(true);
                                        }}
                                        className="flex-row items-center justify-between h-12 rounded-xl bg-gray-100 dark:bg-secondary/30 px-3 active:opacity-70"
                                    >
                                        <Text className="text-base text-foreground" numberOfLines={1}>
                                            {formatDateLabel(expenseDate)}
                                        </Text>
                                        <Calendar size={18} color={colors.mutedForeground} />
                                    </Pressable>
                                )}

                                {isDatePickerOpen && Platform.OS !== "ios" && (
                                    <DateTimePicker
                                        value={fromIsoDate(expenseDate)}
                                        mode="date"
                                        display="default"
                                        maximumDate={new Date()}
                                        onChange={(event, date) => {
                                            // Dialogen lukker seg selv etter valg.
                                            setIsDatePickerOpen(false);
                                            if (event.type === "set" && date)
                                                setExpenseDate(toIsoDate(date));
                                        }}
                                    />
                                )}
                            </View>
                        </View>

                        <Select
                            label="Gruppe"
                            value={selectedGroup?.name ?? null}
                            placeholder={
                                options.isPending ? "Laster grupper..." : "Velg gruppe"
                            }
                            isOpen={openPicker === "group"}
                            onToggle={() =>
                                setOpenPicker(openPicker === "group" ? null : "group")
                            }
                            items={(options.data?.groups ?? []).map((group) => ({
                                key: group.slug,
                                label: group.name,
                                selected: group.slug === groupSlug,
                            }))}
                            onSelect={(key) => {
                                setGroupSlug(key);
                                setOpenPicker(null);
                            }}
                            colors={colors}
                        />

                        <Select
                            label="Budsjett"
                            value={selectedBudget?.label ?? null}
                            placeholder="Velg budsjett"
                            isOpen={openPicker === "budget"}
                            onToggle={() =>
                                setOpenPicker(openPicker === "budget" ? null : "budget")
                            }
                            items={(options.data?.budgetTypes ?? []).map((budget) => ({
                                key: budget.value,
                                label: budget.label,
                                selected: budget.value === budgetType,
                            }))}
                            onSelect={(key) => {
                                setBudgetType(key as BudgetType);
                                setOpenPicker(null);
                            }}
                            colors={colors}
                        />

                        <View>
                            <Text className="text-sm text-muted-foreground mb-1.5">
                                Hva gjelder utlegget?
                            </Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                maxLength={5000}
                                textAlignVertical="top"
                                placeholder="Beskriv kort hva du har kjøpt og hvorfor"
                                placeholderTextColor={colors.mutedForeground}
                                className="min-h-24 rounded-xl bg-gray-100 dark:bg-secondary/30 px-4 py-3 text-base text-foreground"
                            />
                        </View>
                    </View>

                    <SectionHeader title="Utbetaling" />
                    <View className="gap-y-3 mb-6">
                        <View>
                            <Text className="text-sm text-muted-foreground mb-1.5">
                                Kontonummer
                            </Text>
                            <TextInput
                                value={accountNumber}
                                onChangeText={(text) =>
                                    setAccountNumber(formatAccountNumber(text))
                                }
                                keyboardType="number-pad"
                                autoCorrect={false}
                                placeholder="1234.56.78901"
                                placeholderTextColor={colors.mutedForeground}
                                className={inputClass}
                            />
                            {/* Sier fra mens man skriver i stedet for å vente til
                                man trykker «Send inn utlegg». */}
                            {accountNumber.length > 0 &&
                                !ACCOUNT_PATTERN.test(accountNumber) && (
                                    <Text className="text-xs text-muted-foreground mt-1.5">
                                        {`Mangler ${11 - accountNumber.replace(/\D/g, "").length} siffer.`}
                                    </Text>
                                )}
                        </View>

                        <View>
                            <Text className="text-sm text-muted-foreground mb-1.5">Navn</Text>
                            <TextInput
                                value={contactName}
                                onChangeText={setContactName}
                                maxLength={200}
                                autoCapitalize="words"
                                autoComplete="name"
                                textContentType="name"
                                placeholder="Ditt navn"
                                placeholderTextColor={colors.mutedForeground}
                                className={inputClass}
                            />
                        </View>

                        <View>
                            <Text className="text-sm text-muted-foreground mb-1.5">E-post</Text>
                            <TextInput
                                value={contactEmail}
                                onChangeText={setContactEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                // Autokorrektur på en e-postadresse gjør mer skade enn nytte.
                                autoCorrect={false}
                                autoComplete="email"
                                textContentType="emailAddress"
                                placeholder="din@epost.no"
                                placeholderTextColor={colors.mutedForeground}
                                className={inputClass}
                            />
                        </View>

                        <Select
                            label="Kopi til økonomiansvarlig (valgfritt)"
                            value={selectedCc?.name ?? null}
                            placeholder="Ingen"
                            isOpen={openPicker === "cc"}
                            onToggle={() => setOpenPicker(openPicker === "cc" ? null : "cc")}
                            items={[
                                { key: "", label: "Ingen", selected: ccEmail === null },
                                ...(options.data?.ccOptions ?? []).map((option) => ({
                                    key: option.email,
                                    label: option.name,
                                    selected: option.email === ccEmail,
                                })),
                            ]}
                            onSelect={(key) => {
                                setCcEmail(key === "" ? null : key);
                                setOpenPicker(null);
                            }}
                            colors={colors}
                        />
                    </View>

                    {options.isError && (
                        <Text className="text-destructive text-sm mb-4">
                            Kunne ikke laste grupper og budsjetter: {options.error.message}
                        </Text>
                    )}

                    {formError && (
                        <View className="flex-row items-start rounded-xl bg-destructive/10 dark:bg-destructive/20 px-4 py-3 mb-3">
                            <TriangleAlert size={18} color={colors.destructive} />
                            <Text className="text-sm text-destructive ml-2 flex-1">
                                {formError}
                            </Text>
                        </View>
                    )}

                    <Pressable
                        onPress={handleSubmit}
                        disabled={submit.isPending}
                        className={`flex-row items-center justify-center h-14 rounded-2xl bg-primary ${
                            submit.isPending ? "opacity-60" : "active:opacity-80"
                        }`}
                    >
                        {submit.isPending ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text
                                className="text-base font-semibold text-white"
                                style={{ fontFamily: "Inter" }}
                            >
                                Send inn utlegg
                            </Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </PageWrapper>
    );
}

type SelectItem = { key: string; label: string; selected: boolean };

/**
 * Nedtrekksliste som utvider seg på stedet.
 *
 * En bottom sheet ville tatt over hele skjermen midt i et langt skjema; her
 * blir feltet stående der det er, og lista legger seg under.
 */
function Select({
    label,
    value,
    placeholder,
    isOpen,
    onToggle,
    items,
    onSelect,
    colors,
}: {
    label: string;
    value: string | null;
    placeholder: string;
    isOpen: boolean;
    onToggle: () => void;
    items: SelectItem[];
    onSelect: (key: string) => void;
    colors: ReturnType<typeof themeColors>;
}) {
    return (
        <View>
            <Text className="text-sm text-muted-foreground mb-1.5">{label}</Text>
            <Pressable
                onPress={onToggle}
                className="flex-row items-center justify-between h-12 rounded-xl bg-gray-100 dark:bg-secondary/30 px-4 active:opacity-70"
            >
                <Text
                    className={`text-base ${value ? "text-foreground" : "text-muted-foreground"}`}
                >
                    {value ?? placeholder}
                </Text>
                <ChevronDown size={18} color={colors.mutedForeground} />
            </Pressable>

            {isOpen && (
                <View className="mt-2 rounded-xl bg-gray-100 dark:bg-secondary/30 overflow-hidden">
                    {items.map((item, index) => (
                        <Pressable
                            key={item.key || `item-${index}`}
                            onPress={() => onSelect(item.key)}
                            className="flex-row items-center justify-between px-4 py-3.5 active:opacity-70"
                        >
                            <Text className="text-base text-foreground flex-1 pr-2">
                                {item.label}
                            </Text>
                            {item.selected && <Check size={18} color={colors.primary} />}
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}
