import { Stack, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import { QrCode } from "lucide-react-native";

export default function ProfilLayout() {
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();

    return (
        <Stack
            screenOptions={{
                headerBackTitle: "Tilbake",
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: true,
                    title: "Profil",
                    headerTitleAlign: "center",
                    // QR-koden hører hjemme her — den er det eneste som ligger i headeren.
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push("/(app)/(modals)/qrmodal")}
                            hitSlop={8}
                            className="w-10 h-10 items-center justify-center"
                        >
                            {({ pressed }) => (
                                <View style={{ opacity: pressed ? 0.7 : 1 }}>
                                    <QrCode
                                        size={22}
                                        strokeWidth={2}
                                        color={themeColors(isDarkColorScheme).foreground}
                                    />
                                </View>
                            )}
                        </Pressable>
                    ),
                }}
            />
        </Stack>
    );
}
