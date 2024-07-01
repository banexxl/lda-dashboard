import { MongoClient } from "mongodb";

type User = {
     _id: any;
     email: string;
     // other user properties
};

type GetUserByEmailResult = User | null;

export const UserServices = () => {

     const getUserByEmail = async (email: string): Promise<GetUserByEmailResult> => {

          const client = new MongoClient(process.env.MONGODB_URI!);

          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const collection = await database.collection('Auth').find({ email: email }).toArray();
               const user = collection[0] as User;
               return user;
          } catch (error: any) {
               console.error('Error while fetching count:', error);
               return null; // Return false or handle the error accordingly
          } finally {
               await client.close(); // Ensure the client is closed after operation
          }
     }

     return {
          getUserByEmail
     }
}
