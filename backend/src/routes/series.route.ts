import { Hono } from "hono";
import { getAllSeries, getSeriesBySlug, createSeries } from "../controllers/series.controller.js";
import { authRequired, authorOnly } from "../middlewares/auth.middleware.js";

const seriesRoute = new Hono();

seriesRoute.get("/", getAllSeries);
seriesRoute.get("/:slug", getSeriesBySlug);
seriesRoute.post("/", authRequired, authorOnly, createSeries);

export default seriesRoute;
