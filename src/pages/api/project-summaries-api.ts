import { MongoClient, ObjectId } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next/types'
import moment from 'moment';

type GeneralProjectSummaryFields = {
     projectSummaryURL?: string;
     projectSummaryCoverURL?: string;
     status?: string;
     category?: string;
     gallery?: any;
     projectEndDateTime?: Date;
     projectStartDateTime?: Date;
     organizers?: any;
     locations?: any;
     applicants?: any;
     donators?: any;
     publications?: any;
     links?: any;
     title?: string;
     locale?: string;
};

type ProjectActivityFields = {
     projectSummaryDescription: string;
     projectSummarySubtitleURL: string;
     projectSummaryDateTime: string;
     projectSummarySubtitle: string;
};

function extractGeneralFields(requestBody: any): GeneralProjectSummaryFields {
     return {
          projectSummaryURL: requestBody.projectSummaryURL,
          projectSummaryCoverURL: requestBody.projectSummaryCoverURL,
          status: requestBody.status,
          category: requestBody.category,
          gallery: requestBody.gallery,
          projectEndDateTime: requestBody.projectEndDateTime ? new Date(requestBody.projectEndDateTime) : undefined,
          projectStartDateTime: requestBody.projectStartDateTime ? new Date(requestBody.projectStartDateTime) : undefined,
          organizers: requestBody.organizers,
          locations: requestBody.locations,
          applicants: requestBody.applicants,
          donators: requestBody.donators,
          publications: requestBody.publications,
          links: requestBody.links,
          title: requestBody.title,
          locale: requestBody.locale,
     };
}

function extractArrayFields(requestBody: any): ProjectActivityFields {
     return {
          projectSummaryDescription: requestBody.projectSummaryDescription,
          projectSummarySubtitleURL: requestBody.projectSummarySubtitleURL,
          projectSummaryDateTime: requestBody.projectSummaryDateTime,
          projectSummarySubtitle: requestBody.projectSummarySubtitle,
     };
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

     const mongoClient = await MongoClient.connect(process.env.MONGODB_URI!)
     const dbProjectSummaries = mongoClient.db('LDA_DB').collection('ProjectSummaries')

     try {
          if (request.method === 'GET') {

               const allProjects = await dbProjectSummaries.find({}).toArray()
               return response.status(200).json({ message: 'Projects found!', data: allProjects });

          } else if (request.method === 'POST') {
               // const projectStart = moment(request.body.projectStartDateTime)
               // const projectEnd = moment(request.body.projectEndDateTime)
               const newProjectObject = {
                    ...request.body,
                    projectStartDateTime: new Date(request.body.projectStartDateTime),
                    projectEndDateTime: new Date(request.body.projectEndDateTime),
               }

               try {
                    await dbProjectSummaries.insertOne(newProjectObject)

                    return response.status(200).json({ message: 'Project successfully added!' });
               } catch (error) {
                    console.log(error);
               }

          } else if (request.method === 'DELETE') {
               //const idsToDelete = request.body.selected.map((_id: any) => new ObjectId(_id))
               try {
                    const deleteResponse = await dbProjectSummaries.deleteOne({ _id: ObjectId.createFromHexString(request.body) })
                    return deleteResponse.deletedCount > 0 ? response.status(200).json({ message: 'Projekat uspesno obrisan' }) : response.status(400).json({ message: 'Projekat nije obrisan' });
               } catch (error) {
                    alert(error);
               }
          } else if (request.method === 'PUT') {
               const requestBody = request.body;
               const generalFields = extractGeneralFields(requestBody);
               const arrayFields = extractArrayFields(requestBody);
               // Determine if requestBody contains general fields or array fields
               const isGeneralFields = Object.keys(generalFields).some(key => generalFields[key as keyof GeneralProjectSummaryFields] !== undefined);
               const isProjectActivityFields = Object.keys(arrayFields).some(key => arrayFields[key as keyof ProjectActivityFields] !== undefined);
               try {
                    const projectId = new ObjectId(requestBody._id);
                    if (isGeneralFields && isProjectActivityFields) {
                         return response.status(400).json({ message: 'Request body cannot contain both general and project activity fields', status: 'Bad Request' });
                    }

                    let updateOperations: any = {};

                    if (isGeneralFields) {
                         updateOperations.$set = generalFields;
                    }

                    if (isProjectActivityFields) {
                         updateOperations.$push = {
                              projectSummaryDescriptions: arrayFields.projectSummaryDescription,
                              projectSummarySubtitleURLs: arrayFields.projectSummarySubtitleURL,
                              projectSummaryDateTime: moment(arrayFields.projectSummaryDateTime).utcOffset('+01:00').format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
                              projectSummarySubtitles: arrayFields.projectSummarySubtitle,
                         };
                    }

                    const mdbResponse = await dbProjectSummaries.updateOne(
                         { _id: projectId },
                         updateOperations
                    );

                    return mdbResponse.modifiedCount > 0
                         ? response.status(200).json({ message: 'Project successfully updated!', status: 'OK' })
                         : response.status(400).json({ message: 'Project not updated!', status: 'Bad Request' });
               } catch (error) {
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


