import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/hostels/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/hostel/$id", params: { id: params.id } });
  },
});
