import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "./__root.css";
import { TrpcProvider } from "@/lib/trpc";
import { Provider } from "react-redux";
import store from "./-store";
import { Toaster } from "@/components/ui/toaster";

export const Route = createRootRoute({
  component: () => (
    <Provider store={store}>
      <TrpcProvider>
        <Outlet />
        <TanStackRouterDevtools />
        <Toaster />
      </TrpcProvider>
    </Provider>
  ),
});
