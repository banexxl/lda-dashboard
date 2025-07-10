import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';

export const PublicationsServices = () => {
     const client = new MongoClient(process.env.MONGODB_URI!);

     const getAllPublications = async () => {
          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const collection = database.collection('Publications');
               const publications = await collection.find({}).toArray();
               return publications;
          } catch (error: any) {
               console.error('Error while fetching publications:', error);
               return -1; // Handle error accordingly
          } finally {
               await client.close();
          }
     };

     const getPublicationsByPage = async (page: number, limit: number) => {
          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const parsedLimit = parseInt(limit.toString(), 10);

               if (isNaN(parsedLimit) || parsedLimit <= 0) {
                    return [];
               }

               const skip = page * parsedLimit;
               const publications = await database
                    .collection('Publications')
                    .find({})
                    .skip(skip)
                    .limit(parsedLimit)
                    .toArray();

               return publications;
          } catch (error: any) {
               console.error('Error while fetching publications by page:', error);
               return { message: error.message };
          } finally {
               await client.close();
          }
     };

     const getPublicationsCount = async () => {
          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const count = await database.collection('Publications').countDocuments();
               return count;
          } catch (error: any) {
               console.error('Error while fetching publications count:', error);
               return -1; // Handle error accordingly
          } finally {
               await client.close();
          }
     };

     const updatePublication = async (id: string, updatedPublication: any) => {
          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const collection = database.collection('Publications');
               const result = await collection.updateOne(
                    { _id: new ObjectId(id) },
                    {
                         $set: {
                              publicationTitle: updatedPublication.publicationTitle,
                              publicationURL: updatedPublication.publicationURL,
                              publicationImageURL: updatedPublication.publicationImageURL,
                              publicationUploadedDateTime: updatedPublication.publicationUploadedDateTime,
                         },
                    }
               );

               return result.modifiedCount > 0; // Return true if update was successful
          } catch (error: any) {
               console.error('Error while updating publication:', error);
               return false; // Return false if the update fails
          } finally {
               await client.close();
          }
     };

     const deletePublication = async (id: string) => {
          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const collection = database.collection('Publications');
               const result = await collection.deleteOne({ _id: new ObjectId(id) });
               return result.deletedCount > 0;
          } catch (error: any) {
               console.error('Error while deleting publication:', error);
               return false;
          } finally {
               await client.close();
          }
     };

     const addPublication = async (publication: any) => {
          try {
               await client.connect();
               const database = client.db('LDA_DB');
               const collection = database.collection('Publications');
               const result = await collection.insertOne(publication);
               return result.insertedId;
          } catch (error: any) {
               console.error('Error while adding publication:', error);
               return null;
          } finally {
               await client.close();
          }
     };

     return {
          getAllPublications,
          getPublicationsByPage,
          getPublicationsCount,
          updatePublication,
          deletePublication,
          addPublication
     };
};


export type Publication = {
     _id: string;
     publicationTitle: string;
     publicationURL: string;
     publicationImageURL: string;
     publicationUploadedDateTime: Date;
};

