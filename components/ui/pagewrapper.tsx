import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface PageWrapperProps {
  children: React.ReactNode;
  refreshQueryKey?: string | string[] | string[][];
  className?: string;
}

export default function PageWrapper({
  children,
  refreshQueryKey,
  className,
}: PageWrapperProps) {
  const queryClient = useQueryClient();
  let [isRefreshing, setIsRefreshing] = useState(false);

  if (!refreshQueryKey) {
    return (
      <SafeAreaWrapper>
        <ScrollView
          className={cn("min-h-full", className ?? "")}
          nestedScrollEnabled
        >
          {children}
        </ScrollView>
      </SafeAreaWrapper>
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
    <SafeAreaWrapper>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        className={cn("min-h-full", className ?? "")}
        nestedScrollEnabled
      >
        {children}
      </ScrollView>
    </SafeAreaWrapper>
  );
}

function SafeAreaWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <SafeAreaView>{children}</SafeAreaView>
    </SafeAreaProvider>
  );
}
