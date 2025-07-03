import express from "express";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/", healthRoutes);
app.use("/", todoRoutes);
app.use("/", taskRoutes);
app.use("/", inviteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 