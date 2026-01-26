import { Platform } from 'react-native';
import { NativeTabs, Icon as NativeIcon, Label } from 'expo-router/unstable-native-tabs';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { View, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import Icon from "@/lib/icons/Icon";
import { QrCode } from '@/lib/icons/QrCode';
import { Text } from '@/components/ui/text';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/lib/useColorScheme';

export default function TabsLayout() {
    // Use NativeTabs on iOS for native liquid glass effect
    if (Platform.OS === 'ios') {
        return (
            <NativeTabs>
                <NativeTabs.Trigger name="karriere">
                    <NativeIcon sf="briefcase.fill" />
                    <Label>Karriere</Label>
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="qr-kode">
                    <NativeIcon sf="qrcode.viewfinder" />
                    <Label>QR-kode</Label>
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="arrangementer">
                    <NativeIcon sf="calendar" />
                    <Label>Arrangementer</Label>
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="gi-bot">
                    <NativeIcon sf="exclamationmark.triangle.fill" />
                    <Label>Gi bot</Label>
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="profil">
                    <NativeIcon sf="person.fill" />
                    <Label>Profil</Label>
                </NativeTabs.Trigger>
            </NativeTabs>
        );
    }

    // Fallback to custom tabs for Android
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const { isDarkColorScheme } = useColorScheme();

    const isActive = (path: string) => pathname.includes(path);

    return (
        <Tabs>
            <TabSlot />
            <TabList style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
                <TabTrigger name="karriere" href="/karriere" reset="never" style={styles.tabButton}>
                    <View style={styles.iconContainer}>
                        <Icon
                            icon="BriefcaseBusiness"
                            className={`self-center stroke-2 w-3.5 h-3.5
                                ${isActive("/karriere") ? "color-primary dark:color-accent" : "color-gray-500 dark:color-gray-400"}`}
                        />
                    </View>
                    <Text className={`text-xs mt-1
                        ${isActive("/karriere") ? "color-primary dark:color-accent font-medium" : "color-gray-500 dark:color-gray-400"
                        }`}>
                        Karriere
                    </Text>
                </TabTrigger>

                <TabTrigger name="qr-kode" href="/qr-kode" reset="never" style={styles.tabButton}>
                    <View style={styles.iconContainer}>
                        <QrCode
                            className={`self-center
                                ${isActive("/qr-kode") ? "color-primary dark:color-accent" : "color-gray-500 dark:color-gray-400"}`}
                            size={14}
                        />
                    </View>
                    <Text className={`text-xs mt-1
                        ${isActive("/qr-kode") ? "color-primary dark:color-accent font-medium" : "color-gray-500 dark:color-gray-400"
                        }`}>
                        QR-kode
                    </Text>
                </TabTrigger>

                <TabTrigger name="arrangementer" href="/arrangementer" reset="never" style={styles.tabButton}>
                    <View style={styles.iconContainer}>
                        <Icon
                            icon="Calendar"
                            className={`self-center stroke-2 w-3.5 h-3.5
                                ${isActive("/arrangementer") ? "color-primary dark:color-accent" : "color-gray-500 dark:color-gray-400"}`}
                        />
                    </View>
                    <Text className={`text-xs mt-1
                        ${isActive("/arrangementer") ? "color-primary dark:color-accent font-medium" : "color-gray-500 dark:color-gray-400"
                        }`}>
                        Arrangementer
                    </Text>
                </TabTrigger>

                <TabTrigger name="gi-bot" href="/gi-bot" reset="never" style={styles.tabButton}>
                    <View style={styles.iconContainer}>
                        <Icon
                            icon="TriangleAlert"
                            className={`self-center stroke-2 w-3.5 h-3.5
                                ${isActive("/gi-bot") ? "color-primary dark:color-accent" : "color-gray-500 dark:color-gray-400"}`}
                        />
                    </View>
                    <Text className={`text-xs mt-1
                        ${isActive("/gi-bot") ? "color-primary dark:color-accent font-medium" : "color-gray-500 dark:color-gray-400"
                        }`}>
                        Gi bot
                    </Text>
                </TabTrigger>

                <TabTrigger name="profil" href="/profil" reset="never" style={styles.tabButton}>
                    <View style={styles.iconContainer}>
                        <Icon
                            icon="UserRound"
                            className={`self-center stroke-2 w-3.5 h-3.5
                                ${isActive("/profil") ? "color-primary dark:color-accent" : "color-gray-500 dark:color-gray-400"}`}
                        />
                    </View>
                    <Text className={`text-xs mt-1
                        ${isActive("/profil") ? "color-primary dark:color-accent font-medium" : "color-gray-500 dark:color-gray-400"
                        }`}>
                        Profil
                    </Text>
                </TabTrigger>
            </TabList>
            <BlurView
                intensity={25}
                tint={isDarkColorScheme ? "dark" : "light"}
                style={[
                    styles.blurContainer,
                    {
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: isDarkColorScheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    }
                ]}
                pointerEvents="none"
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    blurContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 8,
        paddingHorizontal: 16,
        minHeight: 60,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    iconContainer: {
        width: 14,
        height: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
