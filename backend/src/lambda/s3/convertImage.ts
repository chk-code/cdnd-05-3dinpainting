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
// THUMBNAIL AND POSTERIZE
async function processImage(record: S3EventRecord, option: number) {
    const key = record.s3.object.key
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
        image.resize(150, Jimp.AUTO);
        let keyname = "empty"
        // CASE option
        switch(option) { 
            case 1: { 
                logger.info('Posterize');
                image.posterize( 5 );  
                keyname = `${key}-01`
               break; 
            } 
            case 2: { 
                logger.info('Sepia');
                image.sepia();
                keyname = `${key}-02`
               break; 
            } 
            case 3: { 
                logger.info('Greyscale');
                image.greyscale();
                keyname = `${key}-03`
                break; 
            }
            case 4: { 
                logger.info('Inverted');
                image.invert(); 
                keyname = `${key}-04`
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