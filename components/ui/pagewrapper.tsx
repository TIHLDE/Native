import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
}

export default function PageWrapper({ children, className }: PageWrapperProps) {

    return (
        <SafeAreaProvider>
            <SafeAreaView className={`flex-1 ${className ?? ""}`}>
                {children}
            </SafeAreaView>
        </SafeAreaProvider>
    )
}
