import express from "express";
import cors from "cors";
import { ProductServlet } from "./productServlet";
import { UserServlet } from "./userServlet";
import { MessageServlet } from "./messageServlet";
import { FeedbackServlet } from "./feedbackServlet";
import { FlagServlet } from "./flagServlet";
import https from "https";
import fs from "fs";

const app = express();
const PORT = 8000;
app.use(cors({
	origin: process.env.ORIGIN,
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));
app.use(express.json());
app.use(express.urlencoded());

app.use(ProductServlet.PATH, ProductServlet.router);
app.use(UserServlet.PATH, UserServlet.router);
app.use(MessageServlet.PATH, MessageServlet.router);
app.use(FlagServlet.PATH, FlagServlet.router);
app.use(FeedbackServlet.PATH, FeedbackServlet.router);

https.createServer({
	key: fs.readFileSync("/etc/letsencrypt/live/sitelinetrading.com/privkey.pem"),
	cert: fs.readFileSync("/etc/letsencrypt/live/sitelinetrading.com/fullchain.pem")
  }, app).listen(PORT, () => {
	console.log(`⚡️[server]: Server is running at https://sitelinetrading:${PORT}`);
})