import { MongoClient, ObjectId } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next/types'
import { UTApi } from 'uploadthing/server';
import moment from 'moment';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

     const mongoClient = await MongoClient.connect(process.env.MONGODB_URI!)
     const dbProjectSummaries = mongoClient.db('LDA_DB').collection('ProjectSummaries')

     try {
          if (request.method === 'GET') {

               const allProjects = await dbProjectSummaries.find({}).toArray()
               return response.status(200).json({ message: 'Projects found!', data: allProjects });

          } else if (request.method === 'POST') {
               const projectStart = moment(request.body.projectStartDateTime).toISOString()
               const projectEnd = moment(request.body.projectEndDateTime).toISOString()
               const projectSummarySubtitlesDate = request.body.projectSummaryDateTime.map((date: string) => moment(date).toISOString())
               const newProjectObject = {
                    ...request.body,
                    projectStartDateTime: projectStart,
                    projectEndDateTime: projectEnd,
                    projectSummaryDateTime: projectSummarySubtitlesDate
               }

               try {
                    await dbProjectSummaries.insertOne(newProjectObject)
                    return response.status(200).json({ message: 'Project successfully added!' });
               } catch (error) {
                    console.log(error);
               }

          }
          else if (request.method === 'DELETE') {
               //const idsToDelete = request.body.selected.map((_id: any) => new ObjectId(_id))
               try {
                    const deleteResponse = await dbProjectSummaries.deleteOne({ _id: ObjectId.createFromHexString(request.body) })
                    return deleteResponse.deletedCount > 0 ? response.status(200).json({ message: 'Projekat uspesno obrisan' }) : response.status(400).json({ message: 'Projekat nije obrisan' });
               } catch (error) {
                    alert(error);
               }
          }
          else if (request.method === 'PUT') {
               const projectStart = moment(request.body.projectStartDateTime).toISOString()
               const projectEnd = moment(request.body.projectEndDateTime).toISOString()
               const projectSummarySubtitlesDates = request.body.projectSummaryDateTime.map((date: string) => moment(date).toISOString())
               try {
                    const mdbResponse = await dbProjectSummaries.updateOne({ _id: ObjectId.createFromHexString(request.body._id) },
                         {
                              $set: {
                                   projectSummaryURL: request.body.projectSummaryURL,
                                   projectSummaryCoverURL: request.body.projectSummaryCoverURL,
                                   status: request.body.status,
                                   gallery: request.body.gallery,
                                   projectEndDateTime: projectEnd,
                                   projectStartDateTime: projectStart,
                                   organizers: request.body.organizers,
                                   locations: request.body.locations,
                                   applicants: request.body.applicants,
                                   donators: request.body.donators,
                                   publications: request.body.publications,
                                   projectSummaryDescriptions: request.body.projectSummaryDescriptions,
                                   projectSummarySubtitleURLs: request.body.projectSummarySubtitleURLs,
                                   projectSummaryDateTime: projectSummarySubtitlesDates,
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


