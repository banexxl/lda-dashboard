import { MongoClient } from "mongodb";

type User = {
     _id: string;
     email: string;
     // other user properties
};

type GetUserByEmailResult = User[] | [];

export const UserServices = () => {

     const getUserByEmail = async (email: string): Promise<GetUserByEmailResult> => {
          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const collection = await database.collection('Auth').find({ email: email }).toArray();

               const modifiedCollection: User[] = collection.map(doc => {
                    return {
                         ...doc,
                         _id: doc._id.toString(),
                    } as User;
               });

               return modifiedCollection;
          } catch (error: any) {
               console.error('Error while fetching count:', error);
               return []; // Return false or handle the error accordingly
          } finally {
               await client.close(); // Ensure the client is closed after operation
          }
     }

     return {
          getUserByEmail
     }
}
