import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import Jimp from 'jimp/es';
import { createLogger } from '../../utils/logger'

const logger = createLogger('process-image')
const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

const imagesBucketName = process.env.S3_IMGS
const vidsBucketName = process.env.S3_VIDS

export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info('Processing SNS event ', JSON.stringify(event))
    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message
        logger.info('Processing S3 event', s3EventStr)
        const s3Event = JSON.parse(s3EventStr)

        for (const record of s3Event.Records) {
            await processImage(record,1)
            await processImage(record,2)
            await processImage(record,3)
            await processImage(record,4)
        }
    }
}

async function processImage(record: S3EventRecord, option: number) {
    const key = record.s3.object.key
    const resizeTo = 1500
    logger.info("Processing S3 item with key: "+key.toString())
    const response = await s3
        .getObject({
            Bucket: imagesBucketName,
            Key: key
        })
        .promise()

    if (response.Body instanceof Buffer) {
        const body = response.Body; // type narrowed to 'Buffer'
        const image = await Jimp.read(body)
        logger.info('Resizing image');
        image.resize(resizeTo, Jimp.AUTO);
        let keyname = "empty"
        // CASE option
        switch(option) { 
            case 1: { 
                logger.info("Posterize Start");
                image.posterize( 5 );
                keyname = key
                keyname.replace(".jpg","-01.jpg")
                logger.info("Posterize End "+keyname);
               break; 
            } 
            case 2: { 
                logger.info("Sepia Start");
                image.sepia();
                keyname = key
                keyname.replace(".jpg","-02.jpg")
                logger.info("Sepia End "+keyname);
               break; 
            } 
            case 3: { 
                logger.info("Greyscale Start");
                image.greyscale();
                keyname = key
                keyname.replace(".jpg","-03.jpg")
                logger.info("Greyscale End "+keyname);
                break; 
            }
            case 4: { 
                logger.info("Inverted Start");
                image.invert(); 
                keyname = key
                keyname.replace(".jpg","-04.jpg")
                logger.info("Inverted End "+keyname);
                break; 
            }
         }

        const convertedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG)
    
        logger.info(`Writing image back to S3 bucket: ${vidsBucketName}`)
        await s3
            .putObject({
                Bucket: vidsBucketName,
                Key: keyname,
                Body: convertedBuffer
            })
            .promise()
    } else {
        logger.info('AWS.S3.Body is not an instance of type Buffer')
    }
}