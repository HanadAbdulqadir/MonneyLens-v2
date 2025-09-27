import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash-es';

/**
 * Performance optimization hook for large datasets and expensive operations
 */
export const usePerformance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOperations, setLoadingOperations] = useState<Set<string>>(new Set());

  const startOperation = useCallback((operationId: string) => {
    setLoadingOperations(prev => new Set([...prev, operationId]));
    setIsLoading(true);
  }, []);

  const endOperation = useCallback((operationId: string) => {
    setLoadingOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(operationId);
      return newSet;
    });
  }, []);

  useEffect(() => {
    setIsLoading(loadingOperations.size > 0);
  }, [loadingOperations.size]);

  return {
    isLoading,
    startOperation,
    endOperation,
    operationCount: loadingOperations.size
  };
};

/**
 * Debounced search hook for real-time filtering
 */
export const useDebouncedSearch = (initialValue = '', delay = 300) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);

  const debouncedUpdate = useMemo(
    () => debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, delay),
    [delay]
  );

  useEffect(() => {
    debouncedUpdate(searchTerm);
    return () => {
      debouncedUpdate.cancel();
    };
  }, [searchTerm, debouncedUpdate]);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm
  };
};

/**
 * Virtual scrolling hook for large lists
 */
export const useVirtualScroll = (items: any[], itemHeight: number, containerHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

  const visibleItems = useMemo(() => 
    items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }))
  , [items, startIndex, endIndex, itemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    startIndex,
    endIndex
  };
};

/**
 * Memoized data processing hook
 */
export const useMemoizedData = function<T, R>(
  data: T[],
  processor: (data: T[]) => R,
  dependencies: any[] = []
) {
  return useMemo(() => {
    if (!data || data.length === 0) return null;
    return processor(data);
  }, [data, ...dependencies]);
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(elementRef);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);

  return {
    isIntersecting,
    elementRef: setElementRef
  };
};

/**
 * Optimized state hook with batched updates
 */
export const useBatchedState = function<T>(initialState: T) {
  const [state, setState] = useState(initialState);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<T>[]>([]);

  const batchedSetState = useCallback((updates: Partial<T> | ((prev: T) => Partial<T>)) => {
    const update = typeof updates === 'function' ? updates(state) : updates;
    setPendingUpdates(prev => [...prev, update]);
  }, [state]);

  useEffect(() => {
    if (pendingUpdates.length === 0) return;

    const timeoutId = setTimeout(() => {
      setState(prev => {
        let newState = { ...prev };
        pendingUpdates.forEach(update => {
          newState = { ...newState, ...update };
        });
        return newState;
      });
      setPendingUpdates([]);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pendingUpdates]);

  return [state, batchedSetState] as const;
};

/**
 * Optimized chart data hook
 */
export const useChartData = function<T>(
  rawData: T[],
  transformFn: (data: T[]) => any[],
  filters: Record<string, any> = {}
) {
  const { isLoading, startOperation, endOperation } = usePerformance();

  const processedData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    
    startOperation('chart-processing');
    
    try {
      // Apply filters
      let filteredData = rawData;
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          filteredData = filteredData.filter((item: any) => {
            if (Array.isArray(value)) {
              return value.includes(item[key]);
            }
            return item[key] === value;
          });
        }
      });

      const result = transformFn(filteredData);
      endOperation('chart-processing');
      return result;
    } catch (error) {
      endOperation('chart-processing');
      console.error('Chart data processing error:', error);
      return [];
    }
  }, [rawData, transformFn, filters, startOperation, endOperation]);

  return {
    data: processedData,
    isLoading
  };
};

export default {
  usePerformance,
  useDebouncedSearch,
  useVirtualScroll,
  useMemoizedData,
  useIntersectionObserver,
  useBatchedState,
  useChartData
};