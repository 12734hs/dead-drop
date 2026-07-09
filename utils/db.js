import { MongoClient, ObjectId } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'dead_drop';

class DBClient {
  constructor() {
    const url = `mongodb://${HOST}:${PORT}`;
    this.client = new MongoClient(url);
    this.client.connect();
    this.db = this.client.db(DATABASE);
  }

  usersCollection() {
    return this.db.collection('users');
  }

  dropsCollection() {
    return this.db.collection('drops');
  }

  getObjectId(id) {
    return new ObjectId(id);
  }
}
const dbClient = new DBClient();
export default dbClient;