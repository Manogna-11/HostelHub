import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard/student")({
  beforeLoad: () => {
    throw redirect({ to: "/browse" });
  },
});
