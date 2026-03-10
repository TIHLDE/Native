import { Text } from "@/components/ui/text";
import PageWrapper from "@/components/ui/pagewrapper";
import { useColorScheme } from "@/lib/useColorScheme";
import { createFine } from "@/actions/fines/fines";
import { uploadImage } from "@/actions/fines/upload";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    TextInput,
    View,
} from "react-native";
import {
    Camera,
    CheckCircle,
    ImagePlus,
    Minus,
    Plus,
    X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

type SelectedUser = {
    user_id: string;
    first_name: string;
    last_name: string;
    image?: string;
};

export default function ConfirmFine() {
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();
    const mutedColor = isDarkColorScheme ? "#9ca3af" : "#6b7280";

    const {
        groupSlug,
        lawTitle,
        lawParagraph,
        lawAmount,
        selectedUsers: selectedUsersParam,
    } = useLocalSearchParams<{
        groupSlug: string;
        lawId: string;
        lawTitle: string;
        lawParagraph: string;
        lawAmount: string;
        lawDescription: string;
        selectedUsers: string;
    }>();

    const selectedUsers: SelectedUser[] = JSON.parse(selectedUsersParam ?? "[]");

    const [amount, setAmount] = useState(parseInt(lawAmount) || 1);
    const [reason, setReason] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const goBackToStart = () => {
        router.dismissAll();
        router.back();
    };

    useEffect(() => {
        if (isSuccess) {
            const timeout = setTimeout(goBackToStart, 5000);
            return () => clearTimeout(timeout);
        }
    }, [isSuccess]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Toast.show({
                type: "error",
                text1: "Tilgang nektet",
                text2: "Du må gi tilgang til kameraet for å ta bilder.",
            });
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!reason.trim()) return;

        setIsSubmitting(true);
        try {
            let uploadedUrl: string | null = null;
            if (imageUri) {
                uploadedUrl = await uploadImage(imageUri);
            }

            await createFine(groupSlug, {
                description: `§${lawParagraph} - ${lawTitle}`,
                amount,
                reason: reason.trim(),
                user: selectedUsers.map((u) => u.user_id),
                image: uploadedUrl,
            });

            setIsSuccess(true);
        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Feil",
                text2: error.message ?? "Kunne ikke gi bot. Prøv igjen.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <PageWrapper className="flex-1 bg-background">
                <View className="flex-1 items-center justify-center px-6">
                    <View className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mb-6">
                        <CheckCircle
                            size={40}
                            color={isDarkColorScheme ? "#4ade80" : "#16a34a"}
                        />
                    </View>
                    <Text className="text-2xl font-bold text-foreground mb-2">
                        Bot registrert!
                    </Text>
                    <Text className="text-base text-muted-foreground text-center mb-8">
                        Boten ble registrert på {selectedUsers.length} bruker
                        {selectedUsers.length !== 1 ? "e" : ""}.
                    </Text>
                    <Pressable
                        onPress={goBackToStart}
                        className="h-14 rounded-2xl bg-primary dark:bg-[#1C5ECA] items-center justify-center px-8 active:opacity-80"
                    >
                        <Text
                            className="text-white text-base font-semibold"
                            style={{ fontFamily: "Inter" }}
                        >
                            Tilbake
                        </Text>
                    </Pressable>
                </View>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper className="flex-1 bg-background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                keyboardDismissMode="on-drag"
            >
                {/* Law summary */}
                <View className="mx-4 mt-4 bg-primary/10 dark:bg-primary/20 rounded-2xl p-4">
                    <Text className="text-sm font-semibold text-primary dark:text-accent">
                        §{lawParagraph} — {lawTitle}
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-1">
                        {selectedUsers.length} bruker
                        {selectedUsers.length !== 1 ? "e" : ""} valgt
                    </Text>
                </View>

                {/* Selected users */}
                <View className="px-4 mt-5">
                    <Text className="text-base font-semibold text-foreground mb-3">
                        Valgte brukere
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    >
                        <View className="flex-row gap-3">
                            {selectedUsers.map((user) => (
                                <View
                                    key={user.user_id}
                                    className="items-center w-16"
                                >
                                    {user.image ? (
                                        <Image
                                            source={{ uri: user.image }}
                                            className="w-12 h-12 rounded-full"
                                        />
                                    ) : (
                                        <View className="w-12 h-12 rounded-full bg-primary/15 dark:bg-primary/25 items-center justify-center">
                                            <Text className="text-sm font-bold text-primary dark:text-accent">
                                                {user.first_name[0]}
                                                {user.last_name[0]}
                                            </Text>
                                        </View>
                                    )}
                                    <Text
                                        className="text-xs text-muted-foreground mt-1 text-center"
                                        numberOfLines={1}
                                    >
                                        {user.first_name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Amount selector */}
                <View className="px-4 mt-6">
                    <Text className="text-base font-semibold text-foreground mb-3">
                        Antall bøter
                    </Text>
                    <View className="flex-row items-center">
                        <Pressable
                            onPress={() =>
                                setAmount((prev) => Math.max(1, prev - 1))
                            }
                            className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-secondary/30 items-center justify-center active:opacity-70"
                        >
                            <Minus size={20} color={mutedColor} />
                        </Pressable>
                        <View className="mx-4 w-16 items-center">
                            <Text className="text-3xl font-bold text-foreground">
                                {amount}
                            </Text>
                        </View>
                        <Pressable
                            onPress={() => setAmount((prev) => prev + 1)}
                            className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-secondary/30 items-center justify-center active:opacity-70"
                        >
                            <Plus size={20} color={mutedColor} />
                        </Pressable>
                    </View>
                </View>

                {/* Reason textarea */}
                <View className="px-4 mt-6">
                    <Text className="text-base font-semibold text-foreground mb-3">
                        Begrunnelse{" "}
                        <Text className="text-destructive">*</Text>
                    </Text>
                    <TextInput
                        className="bg-gray-100 dark:bg-secondary/30 rounded-2xl px-4 py-3 text-foreground text-base min-h-[120px]"
                        placeholder="Beskriv hvorfor boten gis..."
                        placeholderTextColor={mutedColor}
                        value={reason}
                        onChangeText={setReason}
                        multiline
                        textAlignVertical="top"
                        style={{
                            fontFamily: "Inter",
                            fontSize: 16,
                            lineHeight: 22,
                        }}
                    />
                </View>

                {/* Image picker */}
                <View className="px-4 mt-6">
                    <Text className="text-base font-semibold text-foreground mb-3">
                        Bilde (valgfritt)
                    </Text>
                    {imageUri ? (
                        <View className="relative">
                            <Image
                                source={{ uri: imageUri }}
                                className="w-full h-48 rounded-2xl"
                                resizeMode="cover"
                            />
                            <Pressable
                                onPress={() => setImageUri(null)}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 items-center justify-center"
                            >
                                <X size={16} color="white" />
                            </Pressable>
                        </View>
                    ) : (
                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={pickImage}
                                className="flex-1 h-24 rounded-2xl bg-gray-100 dark:bg-secondary/30 items-center justify-center active:opacity-70"
                            >
                                <ImagePlus size={24} color={mutedColor} />
                                <Text className="text-sm text-muted-foreground mt-2">
                                    Velg bilde
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={takePhoto}
                                className="flex-1 h-24 rounded-2xl bg-gray-100 dark:bg-secondary/30 items-center justify-center active:opacity-70"
                            >
                                <Camera size={24} color={mutedColor} />
                                <Text className="text-sm text-muted-foreground mt-2">
                                    Ta bilde
                                </Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Submit button */}
            <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-3 bg-background border-t border-border">
                <Pressable
                    onPress={handleSubmit}
                    disabled={!reason.trim() || isSubmitting}
                    className={`h-14 rounded-2xl flex-row items-center justify-center ${
                        reason.trim() && !isSubmitting
                            ? "bg-primary dark:bg-[#1C5ECA] active:opacity-80"
                            : "bg-gray-200 dark:bg-secondary/30"
                    }`}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text
                            className={`text-base font-semibold ${
                                reason.trim()
                                    ? "text-white"
                                    : "text-muted-foreground"
                            }`}
                            style={{ fontFamily: "Inter" }}
                        >
                            Gi bot
                        </Text>
                    )}
                </Pressable>
            </View>
        </PageWrapper>
    );
}
