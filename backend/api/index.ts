import { createApp } from "../src/app";
import { VectorStoreManager } from "../src/services/VectorStoreManager";

// Instantiate the core Express application
const app = createApp();

// Ensure the vector store connects securely inside the serverless container execution state
VectorStoreManager.getInstance()
  .initialize()
  .catch((err) => console.error("Failed to initialize Vector Store in serverless proxy", err));

// Vercel exclusively consumes the default export of an Express module to pipeline traffic
export default app;
