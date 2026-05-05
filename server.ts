import "dotenv/config";
import fs from "fs";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Initialize Gemini
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", environment: process.env.NODE_ENV });
  });

  app.get("/api/health/db", async (req, res) => {
    try {
      // Simple query to verify PostgreSQL connection
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "ok", database: "connected", provider: "postgresql" });
    } catch (e: any) {
      console.error("Health check DB error:", e);
      res.status(500).json({ status: "error", message: "Database connection failed" });
    }
  });

  console.log("Checking database connection...");
  let retries = 5;
  while (retries > 0) {
    try {
      const workspaceCount = await prisma.workspace.count();
      console.log(`Database check: Connected. Found ${workspaceCount} workspaces.`);
      if (workspaceCount === 0) {
        const defaultWorkspace = await prisma.workspace.create({
          data: { name: "Default Workspace", slug: "default-ws" }
        });
        console.log("Seeded default workspace:", defaultWorkspace.id);
      }
      break;
    } catch (dbError) {
      retries--;
      console.error(`Database connection failed (${retries} retries left):`, dbError);
      if (retries === 0) {
        console.error("Final database connection attempt failed.");
      } else {
        await new Promise(res => setTimeout(res, 2000));
      }
    }
  }

  // Integrations
  app.get("/api/integrations", async (req, res) => {
    const integrations = await prisma.integration.findMany({
      include: { _count: { select: { requests: true, logs: true } } }
    });
    res.json(integrations);
  });

  app.post("/api/integrations", async (req, res) => {
    const { name, type, config, workspaceId } = req.body;
    const integration = await prisma.integration.create({
      data: { name, type, config: JSON.stringify(config), workspaceId }
    });
    res.json(integration);
  });

  // API Tester / Request Executer
  app.post("/api/test-request", async (req, res) => {
    const { integrationId, method, path, headers, body } = req.body;
    
    let integration;
    if (integrationId) {
      integration = await prisma.integration.findUnique({ where: { id: integrationId } });
    }

    const config = integration ? JSON.parse(integration.config) : {};
    const baseUrl = config.baseUrl || "";
    const fullUrl = `${baseUrl}${path}`;
    
    const startTime = Date.now();
    try {
      const response = await axios({
        method,
        url: fullUrl,
        headers: {
          ...config.headers,
          ...(headers ? JSON.parse(headers) : {})
        },
        data: body ? JSON.parse(body) : undefined,
        timeout: 10000,
        validateStatus: () => true
      });

      const latency = Date.now() - startTime;
      
      // Log request if integration exists
      if (integrationId) {
        await prisma.apiRequest.create({
          data: {
            integrationId,
            method,
            path,
            headers: JSON.stringify(headers),
            body: JSON.stringify(body),
            responseCode: response.status,
            responseBody: JSON.stringify(response.data),
            latency,
            status: response.status < 400 ? "SUCCESS" : "FAILED"
          }
        });

        await prisma.apiLog.create({
          data: {
            integrationId,
            level: response.status < 400 ? "INFO" : "ERROR",
            message: `${method} ${path} returned ${response.status}`,
            context: JSON.stringify({ path, status: response.status, latency })
          }
        });
      }

      res.json({
        status: response.status,
        data: response.data,
        headers: response.headers,
        latency
      });
    } catch (error: any) {
      const latency = Date.now() - startTime;
      
      if (integrationId) {
        await prisma.apiLog.create({
          data: {
            integrationId,
            level: "ERROR",
            message: `Network Error: ${error.message}`,
            context: JSON.stringify({ path, error: error.message, latency })
          }
        });
      }

      res.status(500).json({
        error: error.message,
        latency
      });
    }
  });

  // Logs
  app.get("/api/logs", async (req, res) => {
    const logs = await prisma.apiLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { integration: { select: { name: true } } }
    });
    res.json(logs);
  });

  // Tickets
  app.get("/api/tickets", async (req, res) => {
    const tickets = await prisma.ticket.findMany({
      include: { _count: { select: { messages: true } } },
      orderBy: { updatedAt: "desc" }
    });
    res.json(tickets);
  });

  app.post("/api/tickets", async (req, res) => {
    const { title, description, priority, workspaceId } = req.body;
    const ticket = await prisma.ticket.create({
      data: { title, description, priority, workspaceId }
    });
    res.json(ticket);
  });

  app.get("/api/tickets/:id/messages", async (req, res) => {
    const messages = await prisma.ticketMessage.findMany({
      where: { ticketId: req.params.id },
      orderBy: { createdAt: "asc" }
    });
    res.json(messages);
  });

  app.post("/api/tickets/:id/messages", async (req, res) => {
    const { content, senderId, senderName } = req.body;
    const message = await prisma.ticketMessage.create({
      data: { ticketId: req.params.id, content, senderId, senderName }
    });
    // Update ticket updated timestamp
    await prisma.ticket.update({
      where: { id: req.params.id },
      data: { updatedAt: new Date() }
    });
    res.json(message);
  });

  // Workflows
  app.get("/api/workflows", async (req, res) => {
    const workflows = await prisma.workflow.findMany({
      where: { workspaceId: "default-ws" }
    });
    res.json(workflows);
  });

  app.post("/api/workflows", async (req, res) => {
    const { name, definition, workspaceId } = req.body;
    const workflow = await prisma.workflow.create({
      data: { name, definition: JSON.stringify(definition), workspaceId }
    });
    res.json(workflow);
  });

  // AI Support Chat
  app.post("/api/ai/chat", async (req, res) => {
    const { message, logsContext } = req.body;

    try {
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are a professional API support agent for a platform called API Support Hub. You help developers with Stripe, Meta, WhatsApp, HubSpot, and custom APIs. Be concise and technical. Use the provided log context if it seems relevant to the user's issue.",
      });

      const prompt = `
        You are an expert API Support Engineer. Your goal is to help developers with API integrations.
        Provide technical, accurate, but clear explanations. 
        If the user asks for a payload, format it inside markdown code blocks.
        If they have an error, explain the root cause (e.g. 401, 403, 429) and provide a step-by-step fix.
        
        Latest System Logs (for context):
        ${logsContext || "No logs available."}

        User question: ${message}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({ text });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite middleware (SPA mode)...");
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware attached successfully.");
    } catch (e) {
      console.error("Vite failed to initialize:", e);
    }
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  console.log(`Starting Express server on port ${PORT}...`);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`>>> SERVER READY: http://localhost:${PORT}`);
  });
}

console.log("Bootstrap: Starting startServer()...");
startServer().catch(err => {
  console.error(">>> FATAL BOOTSTRAP ERROR:", err);
  process.exit(1);
});
