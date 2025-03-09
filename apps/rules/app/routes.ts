import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes() satisfies RouteConfig;

/*
export default [
  layout("./routes/_layout.tsx", [
    index("./routes/_page.tsx"),
    route("terms", "./routes/terms.tsx"),
    route("privacy", "./routes/privacy.tsx"),
  ]),

  route("auth", "./routes/auth/_layout.tsx", [
    index("./routes/auth/_page.tsx"),
    route("callback", "./routes/auth/callback.ts"),
  ]),

  route("console", "./routes/console/_layout.tsx", [
    index("./routes/console/_page.tsx"),
    route("profile", "./routes/console/profile.tsx"),

    // route("routes", "./routes/console/routes/_layout.tsx", [
    //   index("./routes/console/routes/_page.tsx"),
    //   route("new", "./routes/console/routes/new.tsx"),
    //   route(":id/edit", "./routes/console/routes/edit.tsx"),
    // ]),
    // route("keys", "./routes/console/keys/_page.tsx"),

    ...prefix("routes", [
      index("./routes/console/routes/_page.tsx"),
      route("new", "./routes/console/routes/new.tsx"),
      // route(":id/edit", "./routes/console/routes/edit.tsx"),
    ]),

    ...prefix("keys", [
      index("./routes/console/keys/_page.tsx"),
      // route("delete/:id", "./routes/console/keys/delete.ts"),
    ]),
  ]),
] satisfies RouteConfig;

*/
