import { Hono } from "hono";
import { CloudflareBindings } from "../types";
import { createMcpServer } from "../features/mcp/server";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

// Note: Using SSEServerTransport directly for cleaner separation of SSE and POST
// But wait, the standard approach for Hono/Workers is likely custom SSE logic or WebStandardStreamableHTTPServerTransport if available.
// Since WebStandardStreamableHTTPServerTransport is available, let's use it as it handles the full lifecycle.

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

    if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.slice(7) !== apiKey) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
  });

  // MCP Endpoint
  // The client connects here via GET (for SSE) and POST (for messages).
  // The WebStandardStreamableHTTPServerTransport handles both.
  mcp.all("/", async (c) => {
    const transport = new WebStandardStreamableHTTPServerTransport();
    const server = createMcpServer(c.env);

    await server.connect(transport);

    // handleRequest returns a Response promise
    return transport.handleRequest(c.req.raw);
  });

  app.route("/api/mcp", mcp);
};
