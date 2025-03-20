import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
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
                        <TouchableOpacity
                            onPressIn={() => router.push("/profil")}
                            style={{ marginRight: 15 }}
                        >
                            <Icon icon="UserRound"  className="self-center stroke-2 dark:text-white" />
                        </TouchableOpacity>
                    ),
                }}
            />
        </Stack>
    );
}
