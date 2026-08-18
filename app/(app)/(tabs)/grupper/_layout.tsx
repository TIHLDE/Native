import { Stack, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { ReceiptText } from "lucide-react-native";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { themeColors } from "@/lib/theme/colors";
import { useColorScheme } from "@/lib/useColorScheme";

export default function GrupperLayout() {
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
                    title: "Grupper",
                    headerTitleAlign: "center",
                    // Utlegg var en egen fane før grupper tok plassen. Den er
                    // fortsatt en personlig ting og hører ikke hjemme inne i en
                    // gruppe, så den ligger som et ikon her — og bare her.
                    // Fordi dette er fanelayouten og ikke gruppesiden, følger
                    // ikonet aldri med lenger inn i stacken.
                    headerLeft: () => (
                        <Pressable
                            onPress={() => router.push("/(app)/(modals)/utlegg")}
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel="Utlegg"
                            className="w-10 h-10 items-center justify-center"
                        >
                            {({ pressed }) => (
                                <View style={{ opacity: pressed ? 0.7 : 1 }}>
                                    <ReceiptText
                                        size={22}
                                        strokeWidth={2}
                                        color={
                                            themeColors(isDarkColorScheme)
                                                .foreground
                                        }
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
