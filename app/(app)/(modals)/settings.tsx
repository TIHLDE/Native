import me, { updateUserProfile } from "@/actions/users/me";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/components/ui/pagewrapper";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { deleteToken } from "@/lib/storage/tokenStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Settings() {
    const { setAuthState } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();

    const user = useQuery({
        queryKey: ["users", "me"],
        queryFn: me,
    });

    const [bio, setBio] = useState("");
    const [github, setGithub] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [allergies, setAllergies] = useState("");

    // Initialize form fields when user data loads
    useEffect(() => {
        if (user.data) {
            setBio(user.data.bio || "");
            setGithub(user.data.github || "");
            setLinkedin(user.data.linkedin || "");
            setAllergies(user.data.allergies || "");
        }
    }, [user.data]);

    const updateMutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users", "me"] });
            Toast.show({
                type: "success",
                text1: "Suksess",
                text2: "Profil oppdatert",
            });
        },
        onError: (error: Error) => {
            Toast.show({
                type: "error",
                text1: "Feil",
                text2: error.message || "Kunne ikke oppdatere profil",
            });
        },
    });

    const handleSave = () => {
        updateMutation.mutate({
            bio: bio || undefined,
            github: github || undefined,
            linkedin: linkedin || undefined,
            allergies: allergies || undefined,
        });
    };

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

    if (user.isPending) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack.Screen options={{ title: '' }} />
                <PageWrapper>
                    <View className="flex-1 justify-center items-center p-4">
                        <Text className="text-lg">Laster innstillinger...</Text>
                    </View>
                </PageWrapper>
            </GestureHandlerRootView>
        );
    }

    if (user.isError) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack.Screen options={{ title: '' }} />
                <PageWrapper>
                    <View className="flex-1 justify-center items-center p-4">
                        <Text className="text-lg text-red-500">
                            Feil: {user.error.message}
                        </Text>
                    </View>
                </PageWrapper>
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Screen options={{ title: '' }} />
            <PageWrapper>
                <ScrollView
                    contentContainerStyle={{ paddingTop: 100 }}
                >
                    <View className="flex flex-col gap-6 p-4">
                    <View className="flex flex-col gap-2">
                        <Label>Bio</Label>
                        <Input
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Skriv din bio her..."
                            multiline
                            numberOfLines={4}
                            className="min-h-[100px]"
                        />
                    </View>

                    <View className="flex flex-col gap-2">
                        <Label>GitHub</Label>
                        <Input
                            value={github}
                            onChangeText={setGithub}
                            placeholder="https://github.com/ditt-brukernavn"
                            keyboardType="url"
                            autoCapitalize="none"
                        />
                    </View>

                    <View className="flex flex-col gap-2">
                        <Label>LinkedIn</Label>
                        <Input
                            value={linkedin}
                            onChangeText={setLinkedin}
                            placeholder="https://linkedin.com/in/ditt-brukernavn"
                            keyboardType="url"
                            autoCapitalize="none"
                        />
                    </View>

                    <View className="flex flex-col gap-2">
                        <Label>Allergier</Label>
                        <Input
                            value={allergies}
                            onChangeText={setAllergies}
                            placeholder="Skriv dine allergier her..."
                        />
                    </View>

                    <Button
                        onPress={handleSave}
                        disabled={updateMutation.isPending}
                        className="mt-4"
                    >
                        <Text>
                            {updateMutation.isPending ? "Lagrer..." : "Lagre endringer"}
                        </Text>
                    </Button>

                    <View className="my-4 border-t border-muted-foreground" />

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full">
                                <Text>Logg ut</Text>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="p-8">
                            <AlertDialogTitle>
                                Er du sikker på at du vil logge ut?
                            </AlertDialogTitle>
                            <AlertDialogAction asChild>
                                <Button variant="destructive" onPressIn={onLogout}>
                                    <Text>Logg ut</Text>
                                </Button>
                            </AlertDialogAction>
                            <AlertDialogCancel>
                                <Text>Avbryt</Text>
                            </AlertDialogCancel>
                        </AlertDialogContent>
                    </AlertDialog>
                </View>
            </ScrollView>
        </PageWrapper>
        </GestureHandlerRootView>
    );
}
