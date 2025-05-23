import '~/global.css';

import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { AuthProvider } from '@/context/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from "react-native-toast-message";
import { PortalHost } from '@rn-primitives/portal';
import { getTheme } from '@/lib/storage/themeStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeToggle } from '@/components/themeToggle';

const LIGHT_THEME: Theme = {
    ...DefaultTheme,
    colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
    ...DarkTheme,
    colors: NAV_THEME.dark,
};

export {
    ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
    const hasMounted = React.useRef(false);
    const { isDarkColorScheme, setColorScheme } = useColorScheme();
    const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
    const queryClient = new QueryClient();


    useIsomorphicLayoutEffect(() => {
        if (hasMounted.current) {
            return;
        }

        if (Platform.OS === 'web') {
            // Adds the background color to the html element to prevent white background on overscroll.
            document.documentElement.classList.add('bg-background');
        }

        getTheme().then((theme) => {
            setColorScheme(theme);
            setIsColorSchemeLoaded(true);
            hasMounted.current = true;
        });
    }, []);

    if (!isColorSchemeLoaded) {
        return null;
    }

    return (
        <AuthProvider>
            <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
                <QueryClientProvider client={queryClient}>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <BottomSheetModalProvider>
                            <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
                            <Stack>
                                <Stack.Screen name="index" options={{ headerShown: false }} />
                                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                                <Stack.Screen
                                    name="profil"
                                    options={{
                                        title: "Profil",
                                        headerShown: true,
                                        headerBackTitle: "Tilbake",
                                        headerTitleAlign: "center",
                                        headerRight: () => (
                                            <TouchableOpacity>
                                                <ThemeToggle />
                                            </TouchableOpacity>
                                        ),
                                    }}
                                />
                                <Stack.Screen
                                    name="qrmodal"
                                    options={{
                                        presentation: "modal",
                                        headerShown: false,
                                    }}
                                />
                            </Stack>
                            <Toast />
                            <PortalHost />
                        </BottomSheetModalProvider>
                    </GestureHandlerRootView>
                </QueryClientProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

const useIsomorphicLayoutEffect =
    Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
