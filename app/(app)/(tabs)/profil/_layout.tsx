import { Stack, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";
import { QrCode } from "lucide-react-native";
import { NotificationBell } from "@/components/notifications/NotificationBell";

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
                    // QR-koden lå til høyre før bjella kom. Høyre side er nå
                    // varsler på alle fanene, så QR-en flyttet til venstre.
                    headerLeft: () => (
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
                    headerRight: () => <NotificationBell />,
                }}
            />
        </Stack>
    );
}
