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

    const isKarriere = pathname.includes("/karriere");
    const isArrangementer = pathname.includes("/arrangementer");

    return (
        <Tabs>
            <TabSlot />
            <TabList style={[styles.tabBarOuter, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                <BlurView
                    intensity={80}
                    tint={isDarkColorScheme ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.topBorder} className="bg-border/30 dark:bg-white/8" />

                {/* Karriere tab */}
                <TabTrigger name="karriere" href="/karriere" reset="never" style={styles.tabItem}>
                    <View className={`rounded-2xl px-3 py-1.5 items-center ${
                        isKarriere ? "bg-primary/15 dark:bg-accent/20" : ""
                    }`}>
                        <Icon
                            icon="BriefcaseBusiness"
                            className={`self-center stroke-2 ${
                                isKarriere
                                    ? "color-primary dark:color-accent"
                                    : "color-gray-400 dark:color-gray-500"
                            }`}
                        />
                        <Text className={`text-[10px] mt-0.5 font-semibold ${
                            isKarriere
                                ? "color-primary dark:color-accent"
                                : "color-gray-400 dark:color-gray-500"
                        }`}>
                            Karriere
                        </Text>
                    </View>
                </TabTrigger>

                {/* QR center button */}
                <View style={styles.qrContainer}>
                    <TouchableWithoutFeedback onPress={() => router.push('/(modals)/qrmodal')}>
                        <View
                            className="bg-primary dark:bg-accent items-center justify-center"
                            style={styles.qrButton}
                        >
                            <QrCode className="color-white dark:color-background" size={26} />
                        </View>
                    </TouchableWithoutFeedback>
                </View>

                {/* Arrangementer tab */}
                <TabTrigger name="arrangementer" href="/arrangementer" reset="never" style={styles.tabItem}>
                    <View className={`rounded-2xl px-3 py-1.5 items-center ${
                        isArrangementer ? "bg-primary/15 dark:bg-accent/20" : ""
                    }`}>
                        <Icon
                            icon="Calendar"
                            className={`self-center stroke-2 ${
                                isArrangementer
                                    ? "color-primary dark:color-accent"
                                    : "color-gray-400 dark:color-gray-500"
                            }`}
                        />
                        <Text className={`text-[10px] mt-0.5 font-semibold ${
                            isArrangementer
                                ? "color-primary dark:color-accent"
                                : "color-gray-400 dark:color-gray-500"
                        }`}>
                            Arrangementer
                        </Text>
                    </View>
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
        paddingTop: 10,
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
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    qrButton: {
        width: 52,
        height: 52,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
});
