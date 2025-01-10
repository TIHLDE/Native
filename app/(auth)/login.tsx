import login, { LoginInput } from "@/actions/auth/login";
import { LeptonError, LoginData } from "@/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


export default function Login() {
    const { setAuthState } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [token, setToken] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);

    const {
        mutate,
        status
    } = useMutation<
        LoginData,
        LeptonError,
        LoginInput
    >({
        mutationFn: login,
        onSuccess: (data) => {
            setToken(data.token);
            setAuthState!({
                token: data.token,
                auhtenticated: true,
                isLoading: false,
            });
            setToken(data.token);
            router.replace("/(tabs)/arrangementer");
        },
        onError: (error) => {
            setError(error.detail);
        }
    });

    const onPress = () => mutate({ email, password });

    return (
        <SafeAreaProvider>
            <SafeAreaView className="flex-1 gap-y-8 px-4 justify-center">
                <View className="gap-y-4">
                    <Text>
                        Brukernavn
                    </Text>
                    <Input
                        className="w-full"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View className="gap-y-4">
                    <Text>
                        Passord
                    </Text>
                    <Input
                        className="w-full"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <Button
                    onPress={onPress}
                    disabled={
                        !email || !password || status === "pending"
                    }
                >
                    <Text>
                        {status === "pending"
                            ? "Logger inn..."
                            : "Logg inn"
                        }
                    </Text>
                </Button>

                <Text>
                    {token}
                </Text>

                {error && (
                    <Text>
                        {error}
                    </Text>
                )}
            </SafeAreaView>
        </SafeAreaProvider>
    );
};