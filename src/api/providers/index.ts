import { Hono } from "hono";

import gitRoutes from "./git";
import messagingRoutes from "./messaging";

const app = new Hono()
  .route("/git", gitRoutes)
  .route("/messaging", messagingRoutes);

export default app;
export type ProvidersApiType = typeof app;
