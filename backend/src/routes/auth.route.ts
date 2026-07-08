import { Hono } from "hono";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const authRoute = new Hono();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.get("/me", authRequired, getMe);

export default authRoute;
