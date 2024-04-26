import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import CVIndexPage from "./cv-index-page";
import CVDashboardPage from "./cv-dashboard-page";
import { AdministrationLayout } from "./administration-layout";

import { trpcReact } from "@/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { APP_URL } from "@/constants";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const rootRoute = createRootRoute({
  component: () => (
    <AdministrationLayout>
      <Outlet />
    </AdministrationLayout>
  ),
});

const cvIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "cvs",
  component: CVIndexPage,
});

const cvDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "dashboard",
  component: CVDashboardPage,
});

const routeTree = rootRoute.addChildren([cvIndexRoute, cvDashboardRoute]);

const router = createRouter({
  routeTree,
});

export default function AdministrationSPA() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpcReact.createClient({
      links: [
        httpBatchLink({
          url: `${APP_URL}/api/trpc`,
        }),
      ],
    })
  );

  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpcReact.Provider>
  );
}
