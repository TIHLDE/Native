import { ThemeToggle } from "@/components/themeToggle";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { deleteToken } from "@/lib/storage";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function Profil() {
    const { setAuthState } = useAuth();
    const router = useRouter();

    const onLogout = async () => {
        const isLoggedOut = await deleteToken();

        if (!isLoggedOut) {
            return Toast.show({
                type: "error",
                text1: "Feil",
                text2: "Kunne ikke logge ut. Prøv igjen.",
            });
        }

        setAuthState!({
            auhtenticated: false,
            isLoading: false,
            token: null,
        });

        router.replace("/(auth)/login");
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView className="gap-y-12 px-4">
                <View className="ml-auto mr-auto p-20 shadow-lg rounded-lg mt-10">
                    <Text className="text-2xl text-center">Profil</Text>
                    <View className="flex flex-col justify-center mt-5">
                        <ThemeToggle />
                    </View>
                </View>

                <Button
                    variant="destructive"
                    onPress={onLogout}
                >
                    <Text>
                        Logg ut
                    </Text>
                </Button>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}