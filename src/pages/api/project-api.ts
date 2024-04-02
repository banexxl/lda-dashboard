import { MongoClient, ObjectId } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next/types'
import { UTApi } from 'uploadthing/server';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

     const mongoClient = await MongoClient.connect(process.env.MONGODB_URI_DEV!, {})
     const dbProjects = mongoClient.db('DAR_DB').collection('Projects')

     try {
          if (request.method === 'GET') {

               const allProjects = await dbProjects.find({}).toArray()
               return response.status(200).json({ message: 'Projects found!', data: allProjects });

          } else if (request.method === 'POST') {
               const newProduct = request.body
               await dbProjects.insertOne(newProduct)
               return response.status(200).json({ message: 'Product successfully added!' });
          }
          else if (request.method === 'DELETE') {
               //const idsToDelete = request.body.selected.map((_id: any) => new ObjectId(_id))
               console.log(request.body);

               try {
                    const newUrl = request.body.imageID.substring(request.body.imageID.lastIndexOf("/") + 1);
                    const utapi = new UTApi()
                    await utapi.deleteFiles(newUrl);

                    await dbProjects.deleteOne({ _id: new ObjectId(request.body.currentProductID) })
                    return response.status(200).json({ message: 'Product successfully deleted!' });
               } catch (error) {
                    alert(error);
               }
          }
          else if (request.method === 'PUT') {
               //const idsToDelete = request.body.selected.map((_id: any) => new ObjectId(_id))

               try {
                    await dbProjects.findOneAndUpdate({ _id: new ObjectId(request.body._id) },
                         {
                              $set: {
                                   bestSeller: request.body.bestSeller,
                                   description: request.body.description,
                                   discount: request.body.discount,
                                   discountAmount: request.body.discountAmount,
                                   availableStock: request.body.availableStock,
                                   imageURL: request.body.imageURL,
                                   ingredients: request.body.ingredients,
                                   instructions: request.body.instructions,
                                   mainCategory: request.body.mainCategory,
                                   manufacturer: request.body.manufacturer,
                                   midCategory: request.body.midCategory,
                                   name: request.body.name,
                                   newArrival: request.body.newArrival,
                                   price: request.body.price,
                                   quantity: request.body.quantity,
                                   subCategory: request.body.subCategory,
                                   warning: request.body.warning
                              }
                         })
                    return response.status(200).json({ message: 'Product successfully updated!' });
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


