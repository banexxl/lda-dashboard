import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

let cachedClient: any = null;
let cachedDb: any = null;

export async function connectToDatabase() {
     // check the cached.
     if (cachedClient && cachedDb) {
          // load from cache
          return {
               client: cachedClient,
               db: cachedDb,
          };
     }

     // Connect to cluster
     let client: any = new MongoClient(process.env.MONGODB_URI_DEV!!);
     await client.connect();
     let db = client.db('LDA_DB');

     // set cache
     cachedClient = client;
     cachedDb = db;

     return {
          client: cachedClient,
          db: cachedDb,
     };
}

export const ProjectSummariesServices = () => {

     const dbConnection = connectToDatabase()

     const getProjectsByPage = async (page: any, limit: any) => {

          const parsedLimit = parseInt(limit, 10); // Parse limit as an integer

          if (isNaN(parsedLimit) || parsedLimit <= 0) {
               // Handle the case when the parsed limit is not a valid positive integer
               return [];
          }

          try {
               const skip = page * parsedLimit;
               const data = await (await dbConnection).db.collection('ProjectSummaries')
                    .find({})
                    .skip(skip)
                    .limit(parsedLimit)
                    .toArray();

               return data;
          } catch (error: any) {
               return { message: error.message };
          }
     };

     const getProjectSummariesCount = async () => {
          const client = new MongoClient(process.env.MONGODB_URI_DEV!);

          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const collection = database.collection('ProjectSummaries');

               // Use countDocuments to get the count of all documents in the collection
               const count = await collection.countDocuments();
               cachedClient.close();
               return count;
          } catch (error: any) {
               console.error('Error while fetching count:', error);
               return -1; // Return -1 or handle the error accordingly
          } finally {
               await client.close();
          }
     }

     return {
          getProjectsByPage,
          getProjectSummariesCount,
     }
}