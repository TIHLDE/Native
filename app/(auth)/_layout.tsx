import { useAuth } from "@/context/auth";
import { Redirect, Stack } from "expo-router";


export default function Layout() {
    const { authState } = useAuth();

    if (authState?.auhtenticated) return <Redirect href="/arrangementer" />;

    return (
        <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack>
    );
};