import { MongoClient } from 'mongodb'

declare global {
  // eslint-disable-next-line no-var
  var __bici_mongo_client: MongoClient | undefined
  // eslint-disable-next-line no-var
  var __bici_mongo_client_promise: Promise<MongoClient> | undefined
}

export function getMongoClient() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }

  if (!global.__bici_mongo_client_promise) {
    const client = new MongoClient(uri)
    global.__bici_mongo_client = client
    global.__bici_mongo_client_promise = client.connect()
  }

  return global.__bici_mongo_client_promise
}

export async function getMongoDb(dbName?: string) {
  const client = await getMongoClient()
  const name = dbName || process.env.MONGODB_DB || undefined
  return name ? client.db(name) : client.db()
}

