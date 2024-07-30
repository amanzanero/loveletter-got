import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "./__root.css";
import { TrpcProvider } from "../lib/trpc";

export const Route = createRootRoute({
  component: () => (
    <TrpcProvider>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
        <Link to="/game" className="[&.active]:font-bold">
          Game
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </TrpcProvider>
  ),
});
