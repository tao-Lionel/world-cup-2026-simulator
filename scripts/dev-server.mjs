import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const port = Number(process.env.PORT) || 8000;
const host = "127.0.0.1";
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

let refreshProcess = null;
let refreshState = {
  running: false,
  ok: null,
  currentStep: "",
  startedAt: null,
  finishedAt: null,
  output: [],
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

function appendOutput(chunk) {
  const text = String(chunk);
  refreshState.output.push(...text.split(/\r?\n/).filter(Boolean));
  refreshState.output = refreshState.output.slice(-80);
  const step = text.match(/\[\d+\/\d+\]\s+([^\r\n]+)/);
  if (step) refreshState.currentStep = step[1];
}

function startRefresh() {
  refreshState = {
    running: true,
    ok: null,
    currentStep: "准备刷新",
    startedAt: new Date().toISOString(),
    finishedAt: null,
    output: [],
  };
  refreshProcess = spawn(process.execPath, [join(projectRoot, "scripts", "refresh-all-data.mjs")], {
    cwd: projectRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });
  refreshProcess.stdout.on("data", appendOutput);
  refreshProcess.stderr.on("data", appendOutput);
  refreshProcess.on("error", (error) => {
    appendOutput(error.message);
    refreshState.running = false;
    refreshState.ok = false;
    refreshState.finishedAt = new Date().toISOString();
    refreshProcess = null;
  });
  refreshProcess.on("close", (code) => {
    refreshState.running = false;
    refreshState.ok = code === 0;
    refreshState.currentStep = code === 0 ? "刷新完成" : "刷新失败，已回滚";
    refreshState.finishedAt = new Date().toISOString();
    refreshProcess = null;
  });
}

async function serveFile(requestPath, response) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const requested = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const filePath = normalize(join(projectRoot, requested));
  if (relative(projectRoot, filePath).startsWith("..")) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/api/data-refresh/status") {
    sendJson(response, 200, refreshState);
    return;
  }
  if (request.method === "POST" && request.url === "/api/data-refresh") {
    if (refreshState.running) {
      sendJson(response, 409, refreshState);
      return;
    }
    startRefresh();
    sendJson(response, 202, refreshState);
    return;
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405);
    response.end("Method not allowed");
    return;
  }
  await serveFile(request.url || "/", response);
});

server.listen(port, host, () => {
  console.log(`世界杯预测已启动：http://${host}:${port}`);
  console.log("页面顶部可点击“刷新数据”。按 Ctrl+C 停止。");
});
