import { View } from 'react-native';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { MoonStar } from '~/lib/icons/MoonStar';
import { Sun } from '~/lib/icons/Sun';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';
import { Switch } from './ui/switch';
import { Text } from './ui/text';

/**
 * Bryter mellom lyst og mørkt tema. Ikonene på hver side viser hvilken
 * modus bryteren står i.
 */
export function ThemeSwitch({ className }: { className?: string }) {
    const { isDarkColorScheme, setColorScheme } = useColorScheme();

    function setTheme(dark: boolean) {
        const newTheme = dark ? 'dark' : 'light';
        setColorScheme(newTheme);
        setAndroidNavigationBar(newTheme);
    }

    return (
        <View
            className={cn(
                'bg-gray-100 dark:bg-secondary/30 rounded-2xl px-4 py-3.5 flex-row items-center justify-between',
                className
            )}
        >
            <Text className="text-base text-foreground">
                {isDarkColorScheme ? 'Mørkt tema' : 'Lyst tema'}
            </Text>

            <View className="flex-row items-center gap-x-2.5">
                <Sun
                    size={18}
                    strokeWidth={2}
                    className={isDarkColorScheme ? 'color-muted-foreground' : 'color-primary'}
                />
                <Switch
                    checked={isDarkColorScheme}
                    onCheckedChange={setTheme}
                    nativeID="theme-switch"
                />
                <MoonStar
                    size={18}
                    strokeWidth={2}
                    className={isDarkColorScheme ? 'color-primary' : 'color-muted-foreground'}
                />
            </View>
        </View>
    );
}
