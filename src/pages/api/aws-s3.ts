// pages/api/upload.js
import aws from 'aws-sdk';
import { log } from 'console';

const s3 = new aws.S3({
     accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
     secretAccessKey: process.env.AWS_S3_SECRET_KEY,
     region: process.env.AWS_REGION,
});

export const config = {
     api: {
          bodyParser: {
               sizeLimit: '2mb' // Set desired value here
          }
     }
}

export default async (req: any, res: any) => {

     if (req.method === 'POST') {

          try {
               const imageFile = req.body;

               if (!imageFile) {
                    return res.status(400).json({ error: 'No file uploaded' });
               }

               const params: aws.S3.PutObjectRequest = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: `${Date.now()}-${Math.floor(Math.random() * 10000000)}.png`, // Unique filename

                    Body: imageFile,
                    ACL: 'public-read', // Make uploaded file publicly accessible
               };

               const uploadedImage = await s3.upload(params).promise();
               console.log('uploadedImage', uploadedImage);

               console.log('Image uploaded successfully:', uploadedImage.Location);
               return res.status(200).json({ imageUrl: uploadedImage.Location });
          } catch (error) {
               console.error('Error uploading image:', error);
               return res.status(500).json({ error: 'Failed to upload image to S3' });
          }
     } else {
          res.status(405).end(); // Method Not Allowed
     }
};
