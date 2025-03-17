import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
}

export default function PageWrapper({ children, className }: PageWrapperProps) {

    return (
        <SafeAreaProvider>
            <SafeAreaView className={className ?? ""}>
                {children}
            </SafeAreaView>
        </SafeAreaProvider>
    )
}
