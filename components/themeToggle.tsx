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
        <Pressable onPressIn={toggleColorScheme}>
            {({ pressed }) => (
                <View
                    className={cn(
                        'flex-1 aspect-square pt-0.5 justify-center web:px-5',
                        pressed && 'opacity-70'
                    )}
                >
                    {isDarkColorScheme ? (
                        <Sun className='text-foreground self-center' size={24} strokeWidth={2} />
                    ) : (
                        <MoonStar className='self-center text-foreground' size={23} strokeWidth={2} />
                    )}
                </View>
            )}
        </Pressable>
    );
}

