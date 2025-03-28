import login, {LoginInput} from "@/actions/auth/login";
import {ApiError, LoginData} from "@/actions/types";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Text} from "@/components/ui/text";
import {useAuth} from "@/context/auth";
import TihldeLogo from "@/lib/icons/TihldeLogo";
import {useMutation} from "@tanstack/react-query";
import {useRouter} from "expo-router";
import {useState} from "react";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as WebBrowser from 'expo-web-browser';
import {
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Linking
} from "react-native";
import PageWrapper from "@/components/ui/pagewrapper";


export default function Login() {
    const {setAuthState} = useAuth();
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

    const onPress = () => mutate({email, password});

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
                    <PageWrapper className="px-2">
                        <ScrollView
                            contentContainerStyle={{flexGrow: 1, justifyContent: "flex-start", gap: 15}}
                            keyboardShouldPersistTaps="handled"
                            className={"px-10"}
                        >
                            <View className="gap-y-0 items-center w-full mt-32 mb-16">
                                <TihldeLogo size="large" className="color-white"/>
                            </View>

                            <View className={"gap-y-0 mb-2"}>
                                <Text className="text-2xl mb-2 font-semibold">
                                    Logg inn
                                </Text>
                                <Text>
                                    Logg inn med ditt TIHLDE-brukernavn og passord
                                </Text>
                            </View>

                            <View className="gap-y-2 mb-10">
                                <Input
                                    placeholder={"Brukernavn"}
                                    className="w-full bg-card border-gray-400 focus:border-black transition duration dark:focus:border-white dark:border-gray-300 rounded-none border-t-0 border-l-0 border-r-0 border-b-1"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View className="gap-y-2  mb-2">
                                <Input
                                    placeholder={"Passord"}
                                    className="w-full bg-card border-gray-400 focus:border-black transition duration-200 dark:focus:border-white dark:border-gray-300 rounded-none border-t-0 border-l-0 border-r-0"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    returnKeyType="done"
                                />
                            </View>

                            <View className=" mb-1">
                                <Button
                                    onPress={onPress}
                                    disabled={!email || !password || status === "pending"}
                                    className="w-full mt-4 "
                                    size={"lg"}
                                >

                                    <Text>
                                        {status === "pending"
                                            ? "Logger inn..."
                                            : "Logg inn"
                                        }
                                    </Text>
                                </Button>
                            </View>

                            <View className="flex flex-row justify-between ">
                                <Button variant={"link"} className={""} onPress={_handlePressButtonForgotPasswordAsync} >
                                    <Text className="dark:text-accent">
                                        Glemt passord?
                                    </Text>
                                </Button>
                                <Button variant={"link"} className={""} onPress={_handlePressButtonCreateUserAsync} >
                                    <Text className="dark:text-accent">
                                        Opprett bruker
                                    </Text>
                                </Button>
                            </View>
                        </ScrollView>
                    </PageWrapper>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaProvider>
    );
};
