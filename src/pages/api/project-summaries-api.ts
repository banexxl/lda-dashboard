import { MongoClient, ObjectId } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next/types'
import { UTApi } from 'uploadthing/server';
import moment from 'moment';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

     const mongoClient = await MongoClient.connect(process.env.MONGODB_URI_DEV!)
     const dbProjectSummaries = mongoClient.db('LDA_DB').collection('ProjectSummaries')

     try {
          if (request.method === 'GET') {

               const allProjects = await dbProjectSummaries.find({}).toArray()
               return response.status(200).json({ message: 'Projects found!', data: allProjects });

          } else if (request.method === 'POST') {
               console.log('POST', request.body);

               try {
                    const newProduct = request.body
                    await dbProjectSummaries.insertOne(newProduct)
                    return response.status(200).json({ message: 'Product successfully added!' });
               } catch (error) {
                    console.log(error);
               }

          }
          else if (request.method === 'DELETE') {
               //const idsToDelete = request.body.selected.map((_id: any) => new ObjectId(_id))
               console.log(request.body);

               try {
                    const newUrl = request.body.imageID.substring(request.body.imageID.lastIndexOf("/") + 1);
                    const utapi = new UTApi()
                    await utapi.deleteFiles(newUrl);

                    await dbProjectSummaries.deleteOne({ _id: new ObjectId(request.body.currentProductID) })
                    return response.status(200).json({ message: 'Product successfully deleted!' });
               } catch (error) {
                    alert(error);
               }
          }
          else if (request.method === 'PUT') {

               try {
                    const mdbResponse = await dbProjectSummaries.updateOne({ '_id': new ObjectId(request.body._id) },
                         {
                              $set: {
                                   projectSummaryURL: request.body.projectSummaryURL,
                                   projectSummaryCoverURL: request.body.projectSummaryCoverURL,
                                   status: request.body.status,
                                   gallery: request.body.gallery,
                                   projectEndDateTime: request.body.projectEndDateTime,
                                   projectStartDateTime: request.body.projectStartDateTime,
                                   organizers: request.body.organizers,
                                   locations: request.body.locations,
                                   applicants: request.body.applicants,
                                   donators: request.body.donators,
                                   publications: request.body.publications,
                                   projectSummaryDescriptions: request.body.projectSummaryDescriptions,
                                   projectSummarySubtitleURLs: request.body.projectSummarySubtitleURLs,
                                   projectSummaryDateTime: request.body.projectSummaryDateTime,
                                   projectSummarySubtitles: request.body.projectSummarySubtitles,
                                   links: request.body.links,
                                   title: request.body.title,
                                   locale: request.body.locale,
                              }
                         }
                    )
                    console.log(mdbResponse);
                    return mdbResponse.modifiedCount > 0 ?
                         response.status(200).json({ message: 'Project successfully updated!', status: 'OK' })
                         :
                         response.status(400).json({ message: 'Project not updated!', status: 'Bad Request' });
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


