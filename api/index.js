// Vercel serverless entry point. The local dev server lives at src/server.js
// and uses app.listen(). On Vercel we don't listen — the platform invokes the
// Express app directly via this default-exported handler.
import app from "../src/app.js";

export default app;
