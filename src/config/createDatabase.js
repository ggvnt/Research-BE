import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const {
  DB_HOST,
  DB_PORT = 5432,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

if (!DB_HOST || !DB_USER || !DB_NAME) {
  console.error(
    "Missing required env vars: DB_HOST, DB_USER, DB_NAME. Check your .env"
  );
  process.exit(1);
}

async function ensureDatabase() {
  // Quote identifier when uppercase or non-standard chars are present
  const quoteIdent = (name) => {
    const needsQuoting = /[A-Z]/.test(name) || /[^a-z0-9_]/i.test(name) || !/^[A-Za-z_]/.test(name);
    if (!needsQuoting) return name;
    return '"' + String(name).replace(/"/g, '""') + '"';
  };

  // Connect to the default 'postgres' database to manage databases
  const adminClient = new Client({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: "postgres",
    ssl:
      process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  });

  try {
    await adminClient.connect();
    console.log("Connected to admin DB (postgres)");

    // Check if target DB exists
    const checkRes = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [DB_NAME]
    );

    if (checkRes.rowCount > 0) {
      console.log(`Database '${DB_NAME}' already exists ✅`);
    } else {
      console.log(`Creating database '${DB_NAME}'...`);
      const ident = quoteIdent(DB_NAME);
      await adminClient.query(
        `CREATE DATABASE ${ident} ENCODING 'UTF8' TEMPLATE template0`
      );
      console.log(`Database '${DB_NAME}' created ✅`);
    }
  } catch (err) {
    console.error("Error ensuring database:", err.message);
    process.exitCode = 1;
  } finally {
    await adminClient.end();
  }
}

ensureDatabase();
