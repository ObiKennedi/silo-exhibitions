import "dotenv/config";
import { Client } from "pg";

async function main() {
    const connectionString = process.env.DATABASE_URL;
    const client = new Client({ connectionString });
    await client.connect();
    console.log("Connected to Neon DB!");
    await client.query('ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "stallsConfig" TEXT;');
    console.log('Successfully ensured "stallsConfig" column exists on "events" table!');
    await client.end();
}

main().catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
});
