import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
}

export default function PageWrapper({ children, className }: PageWrapperProps) {

    return (
        <SafeAreaProvider>
            <SafeAreaView 
                className={className ?? ""} 
                style={className?.includes('flex-1') ? styles.flexContainer : undefined}
                edges={['left', 'right']}
            >
                {children}
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
    },
});
