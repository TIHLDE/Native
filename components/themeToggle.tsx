import { Pressable, View } from 'react-native';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { MoonStar } from '~/lib/icons/MoonStar';
import { Sun } from '~/lib/icons/Sun';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';
import { Button } from './ui/button';

export function ThemeToggle({ className }: { className?: string }) {
    const { isDarkColorScheme, setColorScheme } = useColorScheme();

    function toggleColorScheme() {
        const newTheme = isDarkColorScheme ? 'light' : 'dark';
        setColorScheme(newTheme);
        setAndroidNavigationBar(newTheme);
    }
    return (
        <Pressable
            onPressIn={toggleColorScheme}
            style={{width: 40, height: 40, justifyContent: 'center', alignItems: 'center'}}
        >
            {({ pressed }) => (
                <View style={{opacity: pressed ? 0.7 : 1}}>
                    {isDarkColorScheme ? (
                        <Sun className='text-foreground' size={24} strokeWidth={2} />
                    ) : (
                        <MoonStar className='text-foreground' size={23} strokeWidth={2} />
                    )}
                </View>
            )}
        </Pressable>
    );
}

