import { useEffect, useRef, type RefObject } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface UseVirtualInfiniteScrollOptions {
  itemCount: number;
  scrollElementRef: RefObject<HTMLElement>;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  estimatedItemHeight?: number;
  overscan?: number;
}

export function useVirtualInfiniteScroll({
  itemCount,
  scrollElementRef,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  estimatedItemHeight = 346, // postCardSkeleton 높이 기준
  overscan = 3
}: UseVirtualInfiniteScrollOptions) {
  const listContainerRef = useRef<HTMLDivElement>(null);
  const totalCount = hasNextPage ? itemCount + 1 : itemCount;

  const rowVirtualizer = useVirtualizer({
    count: totalCount,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  useEffect(() => {
    const lastVirtualItem = virtualItems[virtualItems.length - 1];
    if (!lastVirtualItem) return;
    const fetchThresholdIndex = Math.max(itemCount - 2, 0);
    if (
      lastVirtualItem.index >= fetchThresholdIndex &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [virtualItems, itemCount, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    listContainerRef,
    rowVirtualizer,
    virtualItems,
    isLoaderIndex: (index: number) => index >= itemCount
  };
}
