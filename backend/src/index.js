const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3001;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "tododb",
});

app.use(cors());
app.use(express.json());

// Cria a tabela automaticamente ao iniciar
async function initDB() {
  const maxRetries = 10;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          completed BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log("Banco de dados conectado e tabela criada!");
      return;
    } catch (err) {
      console.log(`Tentativa ${i + 1}/${maxRetries} - Aguardando banco de dados...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  console.error("Nao foi possivel conectar ao banco de dados");
  process.exit(1);
}

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Listar tarefas
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar tarefa
app.post("/tasks", async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "O titulo eh obrigatorio" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Marcar como concluida/nao concluida
app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    const result = await pool.query(
      "UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *",
      [completed, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarefa nao encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar tarefa
app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarefa nao encontrada" });
    }
    res.json({ message: "Tarefa removida" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initDB().then(() => {
  app.listen(port, () => {
    console.log(`Backend rodando na porta ${port}`);
  });
});
