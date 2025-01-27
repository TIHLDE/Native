
import { Children, useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import { Text } from './text';


interface AnimatedPagerViewProps {
    children: React.ReactNode;
    titles: string[];
    className?: string;
}

//TODO: lag en ny pager view som fungerer, gjerne uten react-native-pager-view
// vurdere evt å lage en issue på react-native-pager-view men virker som at 
// de folka er jævlig treige på å fikse ting

export default function AnimatedPagerView(props: AnimatedPagerViewProps) {
    const xpos = useSharedValue(0);
    const outerRef = useRef<View>(null);
    const pagerViewRef = useRef<PagerView>(null);
    const [width, setWidth] = useState(0);

    const numberOfPages = Children.count(props.children);

    useEffect(() => {
        if (outerRef.current) {
            outerRef.current.measure((x, y, w, h) => {
                setWidth(w);
            });
        }
    }, [outerRef.current]);

    const handleScroll = (e) => {
        xpos.value = (e.nativeEvent.offset + e.nativeEvent.position) * (width / numberOfPages)
    };

    const scrollIndicatorWidth = 100 / numberOfPages;

    return (
        <View className={props.className} ref={outerRef} >
            <View className="flex-row w-full justify-center">
                {props.titles.map((title, index) => {
                    return (

                        <Pressable className="p-2 flex-1 active:bg-accent rounded-lg" key={index}
                            onPress={() => requestAnimationFrame(() => pagerViewRef.current?.setPage(index))}>
                            <Text className="text-lg w-full text-center">{title}</Text>
                        </Pressable>
                    )
                })
                }
            </View>
            <Animated.View className="mb-4" style={{
                marginLeft: xpos,
                width: scrollIndicatorWidth + "%",
            }}>
                <View className="h-0.5 rounded-full bg-foreground mx-8" />
            </Animated.View>
            <PagerView style={{ flex: 1 }}
                onPageScroll={handleScroll}
                orientation="horizontal"
                ref={pagerViewRef}
                overdrag={true}
            >
                {props.children}
            </PagerView>
        </View>
    )
}