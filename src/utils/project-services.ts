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
     let client: any = new MongoClient(process.env.MONGODB_URI!!);
     await client.connect();
     let db = client.db('DAR_DB');

     // set cache
     cachedClient = client;
     cachedDb = db;

     return {
          client: cachedClient,
          db: cachedDb,
     };
}

export const ProjectsServices = () => {

     const dbConnection = connectToDatabase()

     const getProjectsByPage = async (page: any, limit: any) => {

          const parsedLimit = parseInt(limit, 10); // Parse limit as an integer

          if (isNaN(parsedLimit) || parsedLimit <= 0) {
               // Handle the case when the parsed limit is not a valid positive integer
               return [];
          }

          try {

               const skip = page * parsedLimit;
               const data = (await dbConnection).db.collection('Projects')
                    .find({})
                    .skip(skip)
                    .limit(parsedLimit)
                    .toArray();
               return data;
          } catch (error: any) {
               return { message: error.message };
          }
     };

     async function getProjectsCount() {
          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               await client.connect();
               const database = client.db('DAR_DB');
               const collection = database.collection('Projects');

               // Use countDocuments to get the count of all documents in the collection
               const count = await collection.countDocuments();

               return count;
          } catch (error: any) {
               console.error('Error while fetching count:', error);
               return -1; // Return -1 or handle the error accordingly
          } finally {
               await client.close();
          }
     }

     const getProjectsForHomePage = async () => {

          const client = await MongoClient.connect(process.env.MONGODB_URI!)

          try {
               const db = client.db('DAR_DB')
               let data = await db.collection('Projects').find().toArray()
               return data
          } catch (error: any) {
               return { message: error.message }
          }
          finally {
               await client.close();
          }
     }

     const getAllLogos = async () => {

          const client = await MongoClient.connect(process.env.MONGODB_URI!)

          try {
               const db = client.db('DAR_DB')
               let data = await db.collection('LogoURLs').find().toArray()
               return data
          } catch (error: any) {
               return { message: error.message }
          }
          finally {
               await client.close();
          }
     }

     const getProductById = async (_id: any) => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          try {
               const db = client.db('DAR_DB')
               let project = await db.collection('Projects').findOne({ _id: new ObjectId(_id) })
               return project
          } catch (error: any) {
               return { message: error.message }
          }
          finally {
               await client.close();
          }
     }

     const getProjectsByNameAndOrManufacturer = async (searchTerm: any) => {

          const searchTermArray = searchTerm.split(" ")

          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          try {
               const db = client.db('DAR_DB')
               let projects = await db.collection('Projects')
                    .find({
                         $or: [
                              { "name": { $regex: `${searchTermArray[0]}`, $options: 'i' } },
                              { "manufacturer": { $regex: `${searchTermArray[0]}`, $options: 'i' } },
                              { "name": { $regex: `${searchTermArray[1]}`, $options: 'i' } },
                              { "manufacturer": { $regex: `${searchTermArray[1]}`, $options: 'i' } },
                         ]
                    }
                    ).toArray()

               return projects
          } catch (error: any) {
               return { message: error.message }
          }
          finally {
               await client.close();
          }
     }

     const getProjectsByDiscount = async () => {
          const client = await MongoClient.connect(process.env.MONGODB_URI!)
          try {
               const db = client.db('DAR_DB')
               let projects = await db.collection('Projects').find({ discount: true }).toArray()

               return projects
          } catch (error: any) {
               return { message: error.message }
          }
          finally {
               await client.close();
          }
     }

     return {
          getProjectsByPage,
          getProjectsCount,
          getProjectsForHomePage,
          getProductById,
          getProjectsByNameAndOrManufacturer,
     }
}