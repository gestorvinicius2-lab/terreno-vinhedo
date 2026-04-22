import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.set("trust proxy", 1);
  app.use(cors());
  app.use(bodyParser.json());

  // Google Sheets API Setup
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  // API Routes
  app.post("/api/leads", async (req, res) => {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Nome e telefone são obrigatórios." });
    }

    if (!spreadsheetId) {
      console.error("GOOGLE_SHEET_ID não configurado.");
      return res.status(500).json({ error: "Erro de configuração no servidor." });
    }

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Página1!A:C", // Ajuste o nome da página se necessário
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[new Date().toLocaleString("pt-BR"), name, phone]],
        },
      });

      res.status(200).json({ success: true, message: "Lead capturado com sucesso!" });
    } catch (error: any) {
      console.error("Erro ao salvar no Google Sheets:", error);
      res.status(500).json({ error: "Erro ao processar sua solicitação. Tente novamente mais tarde." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
