import { Stack } from "expo-router";

export default function profilLayout() {

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "Profil"
                }}
            />
            <Stack.Screen name="eventmodal" options={{ presentation: "card", headerShown: false }} />
            <Stack.Screen name="eventRegisterModal" options={{ presentation: "card", title: "Registrer oppmøte", headerShown: false }} />
        </Stack>
    )
}