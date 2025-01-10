import { Text } from "@/components/ui/text";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


export default function Login() {
    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <Text>Login</Text>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};