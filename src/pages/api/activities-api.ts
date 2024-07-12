import { MongoClient, ObjectId } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next/types'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

     const mongoClient = await MongoClient.connect(process.env.MONGODB_URI!)
     const dbActivities = mongoClient.db('LDA_DB').collection('Activities')

     try {
          if (request.method === 'GET') {

               const allactivitys = await dbActivities.find({}).toArray()
               return response.status(200).json({ message: 'activity s found!', data: allactivitys });

          } else if (request.method === 'POST') {
               try {
                    const res = await dbActivities.insertOne(
                         {
                              ...request.body,
                              publishedDate: new Date(request.body.publishedDate)
                         }
                    )
                    return response.status(200).json({ message: 'activity successfully added!', data: res });
               } catch (error) {
                    console.log(error);
               }

          } else if (request.method === 'DELETE') {
               console.log(request.body);

               //const idsToDelete = request.body.selected.map((_id: any) => new ObjectId(_id))
               try {
                    const deleteResponse = await dbActivities.deleteOne({ _id: ObjectId.createFromHexString(request.body) })
                    return deleteResponse.deletedCount > 0 ? response.status(200).json({ message: 'Aktivnost uspesno obrisana' }) : response.status(400).json({ message: 'Aktivnost nije obrisana' });
               } catch (error) {
                    alert(error);
               }
          } else if (request.method === 'PUT') {

               const { _id, ...activityWithoutId } = request.body;

               try {
                    const mdbResponse = await dbActivities.updateOne({ _id: ObjectId.createFromHexString(request.body._id) },
                         {
                              $set: {
                                   ...activityWithoutId,
                                   publishedDate: new Date(request.body.publishedDate)
                              }
                         }
                    )

                    return mdbResponse.modifiedCount > 0 ?
                         response.status(200).json({ message: 'Activity successfully updated!', status: 'OK' })
                         :
                         response.status(400).json({ message: 'Activity not updated!', status: 'Bad Request' });
               } catch (error) {
                    alert(error);
               }
          }
          else {
               return response.status(405).json({ error: 'Method not allowed!' });
          }
     } catch (error) {
          return response.status(500).json({ error: 'Internal server error!' });
     } finally {
          await mongoClient.close();
     }
}


