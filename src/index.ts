import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { logger } from "./common/utils/logger";
import authRouter from "./api/auth/login.controller";
import adminAuthRouter from "./api/auth/admin.controller";
import rechargeRouter from "./api/wallet/recharge.controller";
import consumeRouter from "./api/wallet/consume.controller";
import telegramRouter from "./api/integrations/telegram.controller";
import wordpressRouter from "./api/integrations/wordpress.controller";
import scheduleRouter from "./api/scheduler/schedule.controller";
import uploadRouter from "./api/storage/upload.controller";
import contextRouter from "./api/context/history.controller";
import adminUsersRouter from "./api/admin/users.controller";
import meRouter from "./api/auth/me.controller";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev", { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Serve static files from the public folder and fallback to index.html
const publicPath = path.join(process.cwd(), "public");
app.use(express.static(publicPath));
app.get("/", (_, res) => res.sendFile(path.join(publicPath, "index.html")));

// API routes
app.use("/auth", authRouter);
app.use("/auth", meRouter);
app.use("/auth/admin", adminAuthRouter);
app.use("/admin/users", adminUsersRouter);
app.use("/upload", uploadRouter);
app.use("/wallet/recharge", rechargeRouter);
app.use("/wallet/consume", consumeRouter);
app.use("/integrations/telegram", telegramRouter);
app.use("/integrations/wordpress", wordpressRouter);
app.use("/scheduler", scheduleRouter);
app.use("/context", contextRouter);

// Health check
app.get("/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`🚀 Server listening on http://localhost:${PORT}`);
});

/* -------------------------------------------------
   Inicia workers (em processos separados na prática)
   ------------------------------------------------- */
// Para desenvolvimento rápido, podemos iniciar workers aqui,
// mas em produção recomenda‑se processos independentes.
// TODO: Implementar os workers
// import "./jobs/content.generator";
// import "./jobs/telegram.dispatcher";
// import "./jobs/scheduler.processor";
