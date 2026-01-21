const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const promClient = require("prom-client");

const app = express();
const port = 3000;

// Configuration CORS
app.use(cors());
app.use(express.json());

// Configuration des métriques Prometheus
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Métriques personnalisées
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const messagesTotal = new promClient.Counter({
  name: 'messages_total',
  help: 'Total number of messages',
  registers: [register]
});

// Middleware pour mesurer la durée des requêtes
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
  });
  next();
});

// Configuration PostgreSQL
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "postgres",
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  database: process.env.POSTGRES_DB || "mydb",
  port: 5432,
});

// Test de connexion au démarrage
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL');
    release();
  }
});

// 🔥 ENDPOINT DES MÉTRIQUES PROMETHEUS
app.get("/metrics", async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "API is running", version: "1.0.0" });
});

// Récupérer tous les messages
app.get("/api/messages", async (req, res) => {
  console.log('GET /api/messages - Fetching messages from database');
  try {
    const result = await pool.query("SELECT * FROM messages ORDER BY id DESC");
    console.log(`Found ${result.rows.length} messages`);
    res.json({ messages: result.rows });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      error: "Database error",
      details: err.message
    });
  }
});

// Ajouter un message
app.post("/api/messages", async (req, res) => {
  console.log('POST /api/messages - Adding new message');
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    const result = await pool.query(
      "INSERT INTO messages (message) VALUES ($1) RETURNING *",
      [message]
    );
    messagesTotal.inc(); // Incrémenter le compteur de messages
    console.log('Message added:', result.rows[0]);
    res.json({ success: true, message: result.rows[0] });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      error: "Database error",
      details: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
  console.log(`Metrics available at http://localhost:${port}/metrics`);
  console.log(`Environment: POSTGRES_HOST=${process.env.POSTGRES_HOST}, POSTGRES_DB=${process.env.POSTGRES_DB}`);
});
