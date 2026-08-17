
import { useRef, useState } from 'react';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { SegmentedControl } from './segmented-control';


interface AnimatedPagerViewProps {
    children: React.ReactNode;
    titles: string[];
    className?: string;
    onPageChange?: (index: number) => void;
}

export default function AnimatedPagerView(props: AnimatedPagerViewProps) {
    const pagerViewRef = useRef<PagerView>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <View className={props.className}>
            {/* Tab bar */}
            <SegmentedControl
                className="mx-4 mb-4"
                options={props.titles}
                value={activeIndex}
                onChange={(index) =>
                    requestAnimationFrame(() => pagerViewRef.current?.setPage(index))
                }
            />
            <PagerView style={{ flex: 1 }}
                orientation="horizontal"
                ref={pagerViewRef}
                overdrag={true}
                onPageSelected={(e) => {
                    setActiveIndex(e.nativeEvent.position);
                    props.onPageChange?.(e.nativeEvent.position);
                }}
            >
                {props.children}
            </PagerView>
        </View>
    );
}
