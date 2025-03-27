import Icon from "@/lib/icons/Icon";
import { Stack, useRouter } from "expo-router";
import { TouchableWithoutFeedback, View } from "react-native";

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
                        <TouchableWithoutFeedback onPressIn={() => router.push("/profil")}>
                            <View>
                                <Icon icon="UserRound" className="self-center stroke-2 dark:text-white" />
                            </View>
                        </TouchableWithoutFeedback>


                    ),
                }}
            />
            <Stack.Screen name="eventRegisterModal" options={{ presentation: "card", title: "Registrer oppmøte" }} />
        </Stack>
    );
}
