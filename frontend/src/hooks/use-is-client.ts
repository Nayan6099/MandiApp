import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/**
 * false on the server AND during hydration, true afterwards.
 * Use it for UI that depends on browser-only data, so server and browser HTML always match.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
