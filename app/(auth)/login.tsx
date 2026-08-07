import {Text} from "@/components/ui/text";
import {useAuth} from "@/context/auth";
import TihldeLogo from "@/lib/icons/TihldeLogo";
import {useRouter} from "expo-router";
import {useState} from "react";
import {SafeAreaProvider} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as WebBrowser from 'expo-web-browser';
import {
    View,
    ScrollView,
    ActivityIndicator,
    Pressable,
} from "react-native";
import PageWrapper from "@/components/ui/pagewrapper";
import {cn} from "@/lib/utils";


export default function Login() {
    const {signIn} = useAuth();
    const router = useRouter();

    const [isPending, setIsPending] = useState<boolean>(false);

    /**
     * Passordet skrives inn på tihlde.org, aldri her. Det er poenget med å gå
     * over til OAuth: appen kan ikke lekke en legitimasjon den aldri mottar,
     * og Feide-innlogging blir tilgjengelig på kjøpet.
     */
    const onPress = async () => {
        setIsPending(true);
        try {
            await signIn!();
            router.replace("/arrangementer");
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Feil",
                text2: error instanceof Error ? error.message : "Innlogging feilet",
            });
        } finally {
            setIsPending(false);
        }
    };

    const _handlePressButtonForgotPasswordAsync = async () => {
        await WebBrowser.openBrowserAsync('https://tihlde.org/forgot-password');
    };

    const _handlePressButtonCreateUserAsync = async () => {
        await WebBrowser.openBrowserAsync('https://tihlde.org/register');
    };

    return (
        <SafeAreaProvider>
            <PageWrapper className="flex-1 bg-background">
                <ScrollView
                    contentContainerStyle={{flexGrow: 1}}
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                >
                    {/* Logo */}
                    <View className="items-center mt-24 mb-10">
                        <TihldeLogo size="large" />
                    </View>

                    {/* Content */}
                    <View className="px-6">
                        {/* Header */}
                        <View className="mb-8">
                            <Text className="text-3xl font-bold tracking-tight text-foreground">
                                Velkommen
                            </Text>
                            <Text className="text-base text-muted-foreground mt-1.5">
                                Du sendes til tihlde.org for å logge inn
                            </Text>
                        </View>

                        {/* Login button */}
                        <Pressable
                            onPress={onPress}
                            disabled={isPending}
                            className={cn(
                                "h-14 rounded-2xl items-center justify-center",
                                isPending
                                    ? "bg-primary/40 dark:bg-primary/30"
                                    : "bg-primary active:opacity-80"
                            )}
                        >
                            {isPending ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text
                                    className="text-white text-base font-semibold"
                                    style={{fontFamily: "Inter"}}
                                >
                                    Logg inn med TIHLDE
                                </Text>
                            )}
                        </Pressable>

                        {/* Forgot password */}
                        <View className="items-center mt-6">
                            <Pressable
                                onPress={_handlePressButtonForgotPasswordAsync}
                                hitSlop={8}
                            >
                                <Text className="text-sm text-primary">
                                    Glemt passord?
                                </Text>
                            </Pressable>
                        </View>

                        {/* Create account */}
                        <View className="flex-row items-center justify-center mt-8">
                            <Text className="text-sm text-muted-foreground">
                                Har du ikke en konto?{" "}
                            </Text>
                            <Pressable
                                onPress={_handlePressButtonCreateUserAsync}
                                hitSlop={8}
                            >
                                <Text className="text-sm font-semibold text-primary">
                                    Opprett bruker
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </PageWrapper>
        </SafeAreaProvider>
    );
}
