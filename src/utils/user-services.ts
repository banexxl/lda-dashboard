import { MongoClient } from "mongodb"

export const UserServices = () => {

     const getUserByEmail = async (email: string) => {
          const client = new MongoClient(process.env.MONGODB_URI!);

          console.log(client);

          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const collection = await database.collection('Auth').find({ email: email }).toArray();

               const modifiedCollection = collection.map(doc => {
                    return {
                         ...doc,
                         _id: doc._id.toString()
                    };
               });

               return modifiedCollection;
          } catch (error: any) {
               console.error('Error while fetching count:', error);
               return -1; // Return -1 or handle the error accordingly
          }
     }

     return {
          getUserByEmail
     }
}