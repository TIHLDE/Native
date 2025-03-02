import Icon from "@/lib/icons/Icon";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function ArrangementerLayout() {
    const router = useRouter();

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: true,
                    title: "Arrangementer",
                    headerTitleAlign: "center",
                    headerRight: () => (
                        <TouchableOpacity
                            onPressIn={() => router.push("/profil")}
                            style={{ marginRight: 15 }}
                        >
                            <Icon icon="UserRound" className="self-center stroke-1 dark:text-white" />
                            </TouchableOpacity>
                    ),
                }}
            />
        </Stack>
    );
}
