import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb"

export const ProjectSummariesServices = () => {

     const getAllProjectSummaries = async () => {
          const client = new MongoClient(process.env.MONGODB_URI_DEV!);

          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const collection = database.collection('ProjectSummaries').find({}).toArray();
               return collection;
          } catch (error: any) {
               console.error('Error while fetching count:', error);
               return -1; // Return -1 or handle the error accordingly
          }
     }

     const getProjectsByPage = async (page: any, limit: any) => {

          const client = new MongoClient(process.env.MONGODB_URI_DEV!);
          await client.connect();
          const database = client.db('LDA_DB');
          const parsedLimit = parseInt(limit, 10); // Parse limit as an integer

          if (isNaN(parsedLimit) || parsedLimit <= 0) {
               // Handle the case when the parsed limit is not a valid positive integer
               return [];
          }

          try {
               const skip = page * parsedLimit;
               const data = await database.collection('ProjectSummaries')
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
          await client.connect();
          const database = client.db('LDA_DB');

          try {
               const collection = database.collection('ProjectSummaries');

               // Use countDocuments to get the count of all documents in the collection
               const count = await collection.countDocuments();

               return count;
          } catch (error: any) {
               console.error('Error while fetching count:', error);
               return -1; // Return -1 or handle the error accordingly
          }
     }

     return {
          getProjectsByPage,
          getProjectSummariesCount,
          getAllProjectSummaries
     }
}