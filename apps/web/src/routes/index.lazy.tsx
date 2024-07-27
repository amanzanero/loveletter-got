import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <p className="text-2xl font-bold">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}
