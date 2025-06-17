import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced_value, set_debounced_value] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      set_debounced_value(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debounced_value;
}