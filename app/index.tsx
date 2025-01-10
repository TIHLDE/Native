import { Text } from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { Redirect, SplashScreen } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


export default function Arrangementer() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
      async function prepare() {
        try {
            console.log("Preparing app...");
          // Pre-load fonts, make any API calls you need to do here
          // Artificially delay for two seconds to simulate a slow loading
          // experience. Remove this if you copy and paste the code!
        //   await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {
          console.warn(e);
        } finally {
          // Tell the application to render
          setAppIsReady(true);
        }
      }
  
      prepare();
    }, []);
  
    const onLayoutRootView = useCallback(() => {
      if (appIsReady) {
        // This tells the splash screen to hide immediately! If we call this after
        // `setAppIsReady`, then we may see a blank screen while the app is
        // loading its initial state and rendering its first pixels. So instead,
        // we hide the splash screen once we know the root view has already
        // performed layout.
        SplashScreen.hide();
      }
    }, [appIsReady]);
  
    if (!appIsReady) {
      return null;
    }
    // const { authState } = useAuth();

    // const [showLoading, setShowLoading] = useState<boolean>(true);

    // useEffect(() => {
    //     let timer: NodeJS.Timeout;

    //     if (!authState?.isLoading) {
    //         // Set a timer to hide the loading screen after 2 seconds
    //         timer = setTimeout(() => {
    //             setShowLoading(false);
    //         }, 2000);
    //     }

    //     // Cleanup the timer on unmount or if authState.isLoading changes
    //     return () => {
    //         if (timer) clearTimeout(timer);
    //     };
    // }, [authState?.isLoading]);

    // if (showLoading) {
    //     return (
    //         <SafeAreaProvider>
    //             <SafeAreaView
    //                 className="flex-1 justify-center items-center bg-blue-950"
    //             >
    //                 <Text className="text-center text-8xl font-bold text-white">
    //                     TIHLDE
    //                 </Text>
    //             </SafeAreaView>
    //         </SafeAreaProvider>
    //     );
    // }

    // if (!authState?.auhtenticated) {
    //     return <Redirect href={"/login"} />;
    // };

    return (
        <Redirect href={"/arrangementer"} />
    )
}