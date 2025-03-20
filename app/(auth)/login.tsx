import login, { LoginInput } from "@/actions/auth/login";
import { ApiError, LoginData } from "@/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import TihldeLogo from "@/lib/icons/TihldeLogo";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";


export default function Login() {
    const { setAuthState } = useAuth();
    const router = useRouter();

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
            router.replace("/(tabs)/arrangementer");
        },
        onError: (error) => {
            Toast.show({
                type: "error",
                text1: "Feil",
                text2: error.message,
            });
        }
    });

    const onPress = () => mutate({ email, password });

    return (
        <SafeAreaProvider>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <SafeAreaView className="flex-1 gap-y-8 px-4 justify-center">
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-start", gap: 15 }}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View className="gap-y-0 items-center w-full mt-32 mb-16">
                                <TihldeLogo size="large" className="color-white"/>
                            </View>
                            <View className="gap-y-2">
                                <Text>Brukernavn</Text>
                                <Input
                                    className="w-full"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View className="gap-y-2">
                                <Text>Passord</Text>
                                <Input
                                    className="w-full"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    returnKeyType="done"
                                />
                            </View>

                            <Button
                                onPress={onPress}
                                disabled={!email || !password || status === "pending"}
                                className="w-full mt-4"

                            >
                                <Text>
                                    {status === "pending"
                                        ? "Logger inn..."
                                        : "Logg inn"
                                    }
                                </Text>
                            </Button>
                        </ScrollView>
                    </SafeAreaView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaProvider>
    );
};