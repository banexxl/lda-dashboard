import aws from 'aws-sdk';
import moment from 'moment';

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

     const month = (moment().month() + 1).toString().padStart(2, '0');
     const year = moment().year().toString();

     if (req.method === 'POST') {
          try {
               const { file, title, extension } = req.body;
               if (!file || !title || !extension) {
                    return res.status(400).json({ error: 'Missing file, title, or extension' });
               }


               // Adjust key to desired structure
               const key = `${year}/${month}/${title}/${file.name}.${extension}`;


               const params: aws.S3.PutObjectRequest = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: key,
                    Body: file,
                    ACL: 'public-read', // Make uploaded file publicly accessible
               };

               const uploadedImage = await s3.upload(params).promise();
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
