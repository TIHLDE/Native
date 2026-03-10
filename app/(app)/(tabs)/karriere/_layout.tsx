import { Stack, useRouter } from "expo-router";
import { TouchableWithoutFeedback, View } from "react-native";
import Icon from "@/lib/icons/Icon";

export default function KarriereLayout() {
    const router = useRouter();

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
                    title: "Jobbannonser",
                    headerBackTitle: "Tilbake",
                    headerTitleAlign: "center",
                    headerRight: () => (
                        <TouchableWithoutFeedback onPressIn={() => router.push("/profil")}>
                            <View className="w-10 h-10 items-center justify-center">
                                <Icon icon="UserRound" className="stroke-2 dark:text-white" />
                            </View>
                        </TouchableWithoutFeedback>
                    ),
                }}
            />
        </Stack>
    );
}
