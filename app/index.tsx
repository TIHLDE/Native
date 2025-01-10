import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


export default function Arrangementer() {
    const { authState } = useAuth();

    const [showLoading, setShowLoading] = useState<boolean>(true);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (!authState?.isLoading) {
            // Set a timer to hide the loading screen after 2 seconds
            timer = setTimeout(() => {
                setShowLoading(false);
            }, 2000);
        }

        // Cleanup the timer on unmount or if authState.isLoading changes
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [authState?.isLoading]);

    if (showLoading) {
        return (
            <SafeAreaProvider>
                <SafeAreaView
                    className="flex-1 justify-center items-center bg-blue-950"
                >
                    <Text className="text-center text-8xl font-bold text-white">
                        TIHLDE
                    </Text>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    if (!authState?.auhtenticated) {
        return <Redirect href={"/login"} />;
    };

    return (
        <Redirect href={"/arrangementer"} />
    )
}