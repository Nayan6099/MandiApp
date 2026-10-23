import { defineConfig } from 'orval';

/**
 * Orval reads the backend's Swagger/OpenAPI file and writes typed
 * TanStack Query hooks (useListPrices, useGetStates, ...) for us.
 * Re-run `pnpm api:generate` whenever the backend API changes.
 */
export default defineConfig({
  mandi: {
    input: {
      target: '../backend/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated/endpoints',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      override: {
        mutator: {
          path: 'src/api/fetcher.ts',
          name: 'apiFetch',
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
        query: {
          useQuery: true,
          signal: true,
        },
      },
    },
  },
});
