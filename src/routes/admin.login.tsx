import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: () => {
    throw redirect({ to: "/auth", search: { role: "admin", mode: "login" } });
  },
});
