import { createApp } from "./app.js";
import { backendEnv } from "./env.js";

const app = createApp();

app.listen(backendEnv.port, () => {
  console.log(`Backend adapter running on http://localhost:${backendEnv.port}`);
});
