import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { View, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import Icon from "@/lib/icons/Icon";
import { QrCode } from '@/lib/icons/QrCode';
import { Text } from '@/components/ui/text';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/lib/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
    const pathname = usePathname();
    const router = useRouter();
    const { isDarkColorScheme } = useColorScheme();
    const insets = useSafeAreaInsets();

    const tabColor = (active: boolean) =>
        active
            ? "color-primary dark:color-accent"
            : "color-gray-400 dark:color-gray-500";

    return (
        <Tabs>
            <TabSlot />
            <TabList style={[styles.tabBarOuter, { paddingBottom: insets.bottom }]}>
                <BlurView
                    intensity={90}
                    tint={isDarkColorScheme ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.topBorder} className="bg-border/30 dark:bg-white/10" />

                <TabTrigger name="karriere" href="/karriere" reset="never" style={styles.tabItem}>
                    <Icon
                        icon="BriefcaseBusiness"
                        className={`self-center stroke-[1.8] ${tabColor(pathname.includes("/karriere"))}`}
                    />
                    <Text className={`text-[10px] mt-0.5 font-medium ${tabColor(pathname.includes("/karriere"))}`}>
                        Karriere
                    </Text>
                </TabTrigger>

                <View style={styles.qrContainer}>
                    <TouchableWithoutFeedback onPress={() => router.push('/(modals)/qrmodal')}>
                        <View
                            className="bg-primary dark:bg-accent rounded-full items-center justify-center"
                            style={styles.qrButton}
                        >
                            <QrCode className="color-white dark:color-background" size={22} />
                        </View>
                    </TouchableWithoutFeedback>
                </View>

                <TabTrigger name="arrangementer" href="/arrangementer" reset="never" style={styles.tabItem}>
                    <Icon
                        icon="Calendar"
                        className={`self-center stroke-[1.8] ${tabColor(pathname.includes("/arrangementer"))}`}
                    />
                    <Text className={`text-[10px] mt-0.5 font-medium ${tabColor(pathname.includes("/arrangementer"))}`}>
                        Arrangementer
                    </Text>
                </TabTrigger>
            </TabList>
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBarOuter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
        paddingBottom: 6,
        overflow: 'hidden',
    },
    topBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: StyleSheet.hairlineWidth,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    qrButton: {
        width: 44,
        height: 44,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
});
