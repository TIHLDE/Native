import { cn } from "@/lib/utils";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface PageWrapperProps {
  children: React.ReactNode;
  refreshQueryKey?: string | string[] | string[][];
  hasScrollView?: boolean;
  className?: string;
}

export default function PageWrapper({
  children,
  refreshQueryKey,
  className,
  hasScrollView = true,
}: PageWrapperProps) {
  const queryClient = useQueryClient();
  let [isRefreshing, setIsRefreshing] = useState(false);

  if (!hasScrollView) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaWrapper>
          <BottomSheetModalProvider>
            {children}
          </BottomSheetModalProvider>
        </SafeAreaWrapper>
      </GestureHandlerRootView>
    );
  }

  if (!refreshQueryKey) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaWrapper>
          <BottomSheetModalProvider>
            <ScrollView
              className={cn("min-h-full", className ?? "")}
              nestedScrollEnabled
            >
              {children}
            </ScrollView>
          </BottomSheetModalProvider>
        </SafeAreaWrapper>
      </GestureHandlerRootView>
    );
  }

  const queryKey = Array.isArray(refreshQueryKey)
    ? refreshQueryKey
    : [refreshQueryKey];
  const hasMultipleQueryKeys = Array.isArray(queryKey[0]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    const startTime = Date.now();

    const handleFinish = () => {
      if (Date.now() - startTime < 1000) {
        setTimeout(() => {
          setIsRefreshing(false);
        }, 400 - (Date.now() - startTime));
        return;
      }
      setIsRefreshing(false);
    };

    if (hasMultipleQueryKeys) {
      Promise.all(
        queryKey.map((key) => queryClient.invalidateQueries({ queryKey: key }))
      ).then(handleFinish);
      return;
    }

    queryClient.invalidateQueries({ queryKey: queryKey }).then(handleFinish);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaWrapper>
        <BottomSheetModalProvider>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
            className={cn("min-h-full", className ?? "")}
            nestedScrollEnabled
          >
            {children}
          </ScrollView>
        </BottomSheetModalProvider>
      </SafeAreaWrapper>
    </GestureHandlerRootView>
  );
}

function SafeAreaWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <SafeAreaView>{children}</SafeAreaView>
    </SafeAreaProvider>
  );
}
