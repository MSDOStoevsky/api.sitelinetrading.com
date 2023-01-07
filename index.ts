import express from "express";
import cors from "cors";
import { ProductServlet } from "./productServlet";
import { UserServlet } from "./userServlet";
import { MessageServlet } from "./messageServlet";
import { FeedbackServlet } from "./feedbackServlet";

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.use(ProductServlet.PATH, ProductServlet.router);
app.use(UserServlet.PATH, UserServlet.router);
app.use(MessageServlet.PATH, MessageServlet.router);
app.use(FeedbackServlet.PATH, FeedbackServlet.router);

app.listen(PORT, () => {
	console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
