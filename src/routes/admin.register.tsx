import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/register")({
  beforeLoad: () => {
    throw redirect({ to: "/auth", search: { role: "admin", mode: "signup" } });
  },
});
