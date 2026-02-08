import { Hono } from "hono";
import { CloudflareBindings } from "../types";
import { createMcpServer } from "../features/mcp/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

export const registerMcpRoutes = (app: Hono<{ Bindings: CloudflareBindings }>) => {
  const mcp = new Hono<{ Bindings: CloudflareBindings }>();

  // Authentication Middleware
  mcp.use("*", async (c, next) => {
    const authHeader = c.req.header("Authorization");
    const apiKey = c.env.MCP_API_KEY;

    if (!apiKey) {
        console.warn("MCP_API_KEY is not set in environment bindings.");
        return c.json({ error: "Configuration Error" }, 500);
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const providedKey = authHeader.slice(7);

    // Constant-time comparison using SHA-256
    const encoder = new TextEncoder();
    const providedHash = await crypto.subtle.digest("SHA-256", encoder.encode(providedKey));
    const storedHash = await crypto.subtle.digest("SHA-256", encoder.encode(apiKey));

    const providedHashArray = new Uint8Array(providedHash);
    const storedHashArray = new Uint8Array(storedHash);

    if (providedHashArray.length !== storedHashArray.length) {
       return c.json({ error: "Unauthorized" }, 401);
    }

    let equal = 0;
    for (let i = 0; i < providedHashArray.length; i++) {
      equal |= providedHashArray[i] ^ storedHashArray[i];
    }

    if (equal !== 0) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
  });

  // MCP Endpoint
  // The client connects here via GET (for SSE) and POST (for messages).
  // The WebStandardStreamableHTTPServerTransport handles both.
  mcp.all("/", async (c) => {
    const transport = new WebStandardStreamableHTTPServerTransport();
    // Pass a static identifier for the single API key for now
    const server = createMcpServer(c.env, "primary-env-key");

    await server.connect(transport);

    // handleRequest returns a Response promise
    return transport.handleRequest(c.req.raw);
  });

  app.route("/api/mcp", mcp);
};
