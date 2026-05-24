import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is missing in .env.local");
  process.exit(1);
}

async function makeAdmin() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    const result = await db.collection("users").updateMany({}, { $set: { role: "admin" } });
    
    console.log(`Successfully promoted ${result.modifiedCount} user(s) to admin!`);
  } catch (error) {
    console.error("Error updating users:", error);
  } finally {
    await client.close();
  }
}

makeAdmin();
