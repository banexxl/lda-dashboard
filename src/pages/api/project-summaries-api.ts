import { MongoClient, ObjectId } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next/types'
import moment from 'moment';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

     const mongoClient = await MongoClient.connect(process.env.MONGODB_URI!)
     const dbProjectSummaries = mongoClient.db('LDA_DB').collection('ProjectSummaries')

     try {
          if (request.method === 'GET') {

               const allProjects = await dbProjectSummaries.find({}).toArray()
               return response.status(200).json({ message: 'Projects found!', data: allProjects });

          } else if (request.method === 'POST') {
               const projectStart = moment(request.body.projectStartDateTime)
               const projectEnd = moment(request.body.projectEndDateTime)
               const projectSummarySubtitlesDate = request.body.projectSummaryDateTime.map((date: string) => moment(date))
               const newProjectObject = {
                    ...request.body,
                    projectStartDateTime: new Date(request.body.projectStartDateTime),
                    projectEndDateTime: new Date(request.body.projectEndDateTime),
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
               const requestBody = request.body;
               const projectSummarySubtitlesDates = moment(requestBody.projectSummaryDateTime).toISOString();

               try {
                    const projectId = new ObjectId(requestBody._id);

                    const updateFields = {
                         projectSummaryURL: requestBody.projectSummaryURL,
                         projectSummaryCoverURL: requestBody.projectSummaryCoverURL,
                         status: requestBody.status,
                         gallery: requestBody.gallery,
                         projectEndDateTime: new Date(requestBody.projectEndDateTime),
                         projectStartDateTime: new Date(requestBody.projectStartDateTime),
                         organizers: requestBody.organizers,
                         locations: requestBody.locations,
                         applicants: requestBody.applicants,
                         donators: requestBody.donators,
                         publications: requestBody.publications,
                         links: requestBody.links,
                         title: requestBody.title,
                         locale: requestBody.locale,
                    };

                    const updateArrayFields = {
                         projectSummaryDescriptions: requestBody.projectSummaryDescriptions,
                         projectSummarySubtitleURLs: requestBody.projectSummarySubtitleURLs,
                         projectSummaryDateTime: projectSummarySubtitlesDates,
                         projectSummarySubtitles: requestBody.projectSummarySubtitles,
                    };

                    const updateOperations: any = {
                         $set: updateFields,
                         $push: {
                              projectSummaryDescriptions: updateArrayFields.projectSummaryDescriptions,
                              projectSummarySubtitleURLs: updateArrayFields.projectSummarySubtitleURLs,
                              projectSummaryDateTime: updateArrayFields.projectSummaryDateTime,
                              projectSummarySubtitles: updateArrayFields.projectSummarySubtitles,
                         },
                    };

                    const mdbResponse = await dbProjectSummaries.updateOne(
                         { _id: projectId },
                         updateOperations
                    );

                    console.log(mdbResponse);

                    return mdbResponse.modifiedCount > 0
                         ? response.status(200).json({ message: 'Project successfully updated!', status: 'OK' })
                         : response.status(400).json({ message: 'Project not updated!', status: 'Bad Request' });
               } catch (error) {
                    console.error(error);
                    return response.status(500).json({ message: 'Internal Server Error', status: 'Error' });
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


