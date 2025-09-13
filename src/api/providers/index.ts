import { Hono } from "hono";

import gitRoutes from "./git";
import messagingRoutes from "./messaging";

const app = new Hono();

// Mount provider category routes
app.route("/git", gitRoutes);
app.route("/messaging", messagingRoutes);

export default app;
