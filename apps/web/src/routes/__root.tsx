import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "./__root.css";
import { TrpcProvider } from "@/lib/trpc";

export const Route = createRootRoute({
  component: () => (
    <TrpcProvider>
      <Outlet />
      <TanStackRouterDevtools />
    </TrpcProvider>
  ),
});
