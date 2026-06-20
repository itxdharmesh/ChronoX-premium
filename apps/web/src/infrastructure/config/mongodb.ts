import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Critical Configuration Missing: MONGODB_URI environment variable is undefined.");
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  connectTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

interface GlobalWithMongo extends Global {
  _mongoClientPromise?: Promise<MongoClient>;
}

const globalWithMongo = global as typeof globalThis & GlobalWithMongo;

if (process.env.NODE_ENV === "development") {
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const connectedClient = await clientPromise;
    const db = connectedClient.db("chronox_db");
    return { client: connectedClient, db };
  } catch (error) {
    console.error("Database connection failure:", error);
    throw new Error("Failed to secure connection interface with MongoDB Atlas.");
  }
}
