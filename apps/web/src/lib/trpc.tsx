import { createWSClient, wsLink, loggerLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "@repo/router";
import React from "react";

export const trpc = createTRPCReact<AppRouter>();

// create persistent WebSocket connection
const wsClient = createWSClient({
  url: `ws://localhost:3000`,
});

export const TrpcProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            // eslint-disable-next-line turbo/no-undeclared-env-vars
            (process.env.NODE_ENV === "development" && typeof window !== "undefined") ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        wsLink({
          client: wsClient,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
