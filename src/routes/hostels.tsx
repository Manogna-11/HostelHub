import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/hostels")({
  beforeLoad: () => {
    throw redirect({ to: "/browse" });
  },
});
