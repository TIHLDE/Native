import login, {LoginInput} from "@/actions/auth/login";
import {ApiError, LoginData} from "@/actions/types";
import {Button} from "@/components/ui/button";
import {Text} from "@/components/ui/text";
import {useAuth} from "@/context/auth";
import TihldeLogo from "@/lib/icons/TihldeLogo";
import {useMutation} from "@tanstack/react-query";
import {useRouter} from "expo-router";
import {useRef, useState} from "react";
import {SafeAreaProvider} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as WebBrowser from 'expo-web-browser';
import {
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    TextInput,
    ActivityIndicator,
    Pressable,
} from "react-native";
import PageWrapper from "@/components/ui/pagewrapper";
import {FloatingLabelInput} from "@/components/ui/floating-label-input";
import {cn} from "@/lib/utils";
import {User, Lock} from "lucide-react-native";


export default function Login() {
    const {setAuthState} = useAuth();
    const router = useRouter();
    const passwordRef = useRef<TextInput>(null);

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const {
        mutate,
        status
    } = useMutation<
        LoginData,
        ApiError,
        LoginInput
    >({
        mutationFn: login,
        onSuccess: (data) => {
            setAuthState!({
                token: data.token,
                auhtenticated: true,
                isLoading: false,
            });
            router.replace("/arrangementer");
        },
        onError: (error) => {
            Toast.show({
                type: "error",
                text1: "Feil",
                text2: error.message,
            });
        }
    });

    const onPress = () => mutate({email, password});

    const isPending = status === "pending";
    const isDisabled = !email || !password || isPending;

    const _handlePressButtonForgotPasswordAsync = async () => {
        await WebBrowser.openBrowserAsync('https://tihlde.org/glemt-passord');
    };

    const _handlePressButtonCreateUserAsync = async () => {
        await WebBrowser.openBrowserAsync('https://tihlde.org/ny-bruker');
    };

    return (
        <SafeAreaProvider>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{flex: 1}}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <PageWrapper className="flex-1 bg-background">
                        <ScrollView
                            contentContainerStyle={{flexGrow: 1}}
                            keyboardShouldPersistTaps="handled"
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
                                        Logg inn med din TIHLDE-konto
                                    </Text>
                                </View>

                                {/* Input fields */}
                                <View className="gap-y-4 mb-6">
                                    <FloatingLabelInput
                                        label="Brukernavn"
                                        value={email}
                                        onChangeText={setEmail}
                                        icon={<User />}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        keyboardType="email-address"
                                        returnKeyType="next"
                                        onSubmitEditing={() => passwordRef.current?.focus()}
                                        blurOnSubmit={false}
                                    />

                                    <FloatingLabelInput
                                        ref={passwordRef}
                                        label="Passord"
                                        value={password}
                                        onChangeText={setPassword}
                                        icon={<Lock />}
                                        secureTextEntry
                                        returnKeyType="done"
                                        onSubmitEditing={() => {
                                            if (!isDisabled) onPress();
                                        }}
                                    />
                                </View>

                                {/* Forgot password — right aligned, subtle */}
                                <View className="items-end mb-8">
                                    <Pressable
                                        onPress={_handlePressButtonForgotPasswordAsync}
                                        hitSlop={8}
                                    >
                                        <Text className="text-sm text-primary dark:text-accent">
                                            Glemt passord?
                                        </Text>
                                    </Pressable>
                                </View>

                                {/* Login button */}
                                <Pressable
                                    onPress={onPress}
                                    disabled={isDisabled}
                                    className={cn(
                                        "h-14 rounded-2xl items-center justify-center",
                                        isDisabled
                                            ? "bg-primary/40 dark:bg-primary/30"
                                            : "bg-primary dark:bg-[#1C5ECA] active:opacity-80"
                                    )}
                                >
                                    {isPending ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text
                                            className="text-white text-base font-semibold"
                                            style={{fontFamily: "Inter"}}
                                        >
                                            Logg inn
                                        </Text>
                                    )}
                                </Pressable>

                                {/* Create account */}
                                <View className="flex-row items-center justify-center mt-8">
                                    <Text className="text-sm text-muted-foreground">
                                        Har du ikke en konto?{" "}
                                    </Text>
                                    <Pressable
                                        onPress={_handlePressButtonCreateUserAsync}
                                        hitSlop={8}
                                    >
                                        <Text className="text-sm font-semibold text-primary dark:text-accent">
                                            Opprett bruker
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </ScrollView>
                    </PageWrapper>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaProvider>
    );
}
