import { Stack, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Settings } from "@/lib/icons/Settings";
import { getGlassMorphismHeaderOptions } from "@/lib/headerConfig";

export default function ProfilLayout() {
    const router = useRouter();

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    ...getGlassMorphismHeaderOptions({
                        title: "Profil",
                        headerTitleAlign: "center",
                    }),
                    headerShown: true,
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push("/(app)/(modals)/settings")}
                            className="mr-4"
                        >
                            {({ pressed }) => (
                                <View
                                    className={`p-2 ${pressed ? "opacity-70" : ""}`}
                                >
                                    <Settings
                                        className="text-foreground"
                                        size={24}
                                        strokeWidth={2}
                                    />
                                </View>
                            )}
                        </Pressable>
                    ),
                } as any}
            />
        </Stack>
    );
}
