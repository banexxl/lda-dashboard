import { MongoClient, ObjectId } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next/types'
import moment from 'moment';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

     const mongoClient = await MongoClient.connect(process.env.MONGODB_URI!)
     const dbProjects = mongoClient.db('LDA_DB').collection('Projects')

     try {
          if (request.method === 'GET') {

               const allProjects = await dbProjects.find({}).toArray()
               return response.status(200).json({ message: 'Project s found!', data: allProjects });

          } else if (request.method === 'POST') {
               console.log('usao u post', request.body);

               const projectPublishedDate = moment(request.body.published).toISOString()

               const newProjectObject = {
                    ...request.body,
                    published: projectPublishedDate
               }

               try {
                    const res = await dbProjects.insertOne(newProjectObject)
                    console.log(res);

                    return response.status(200).json({ message: 'Project successfully added!' });
               } catch (error) {
                    console.log(error);
               }

          }
          else if (request.method === 'DELETE') {
               //const idsToDelete = request.body.selected.map((_id: any) => new ObjectId(_id))
               try {
                    const deleteResponse = await dbProjects.deleteOne({ _id: ObjectId.createFromHexString(request.body) })
                    return deleteResponse.deletedCount > 0 ? response.status(200).json({ message: 'Projekat uspesno obrisan' }) : response.status(400).json({ message: 'Projekat nije obrisan' });
               } catch (error) {
                    alert(error);
               }
          }
          else if (request.method === 'PUT') {
               const projectPublished = moment(request.body.published).toISOString()

               try {
                    const mdbResponse = await dbProjects.updateOne({ _id: ObjectId.createFromHexString(request.body._id) },
                         {
                              $set: {
                                   _id: request.body._id,
                                   projectSummaryURL: request.body.projectSummaryURL,
                                   projectURL: request.body.projectURL,
                                   links: request.body.links,
                                   title: request.body.title,
                                   subTitle: request.body.subTitle,
                                   paragraphs: request.body.paragraphs,
                                   category: request.body.category,
                                   status: request.body.status,
                                   locations: request.body.locations,
                                   published: projectPublished,
                                   favorited: request.body.favorited,
                                   favoritedNumber: request.body.favoritedNumber,
                                   organizers: request.body.organizers,
                                   subOrganizers: request.body.subOrganizers,
                                   applicants: request.body.applicants,
                                   donators: request.body.donators,
                                   publications: request.body.publications,
                                   gallery: request.body.gallery,
                                   showProjectDetails: request.body.showProjectDetails,
                                   listTitle: request.body.listTitle,
                                   list: request.body.list,
                                   locale: request.body.locale
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


