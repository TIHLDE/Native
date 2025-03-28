import { Stack, useRouter } from "expo-router";
import { TouchableWithoutFeedback, View } from "react-native";
import Icon from "@/lib/icons/Icon";

export default function KarriereLayout() {
    const router = useRouter();

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: true,
                    title: "Jobbannonser",
                    headerTitleAlign: "center",
                    headerRight: () => (
                        <TouchableWithoutFeedback onPressIn={() => router.push("/profil")}>
                            <View>
                                <Icon icon="UserRound" className="self-center stroke-2 dark:text-white" />
                            </View>
                        </TouchableWithoutFeedback>


                    ),
                }}
            />
        </Stack>
    );
}
