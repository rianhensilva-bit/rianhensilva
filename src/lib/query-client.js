import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 30 * 1000,        // dados ficam "frescos" por 30s
			gcTime: 5 * 60 * 1000,       // cache em memória por 5 min
		},
	},
});