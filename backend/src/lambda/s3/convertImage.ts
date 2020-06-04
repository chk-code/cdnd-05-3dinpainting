import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as Jimp from 'jimp/es'
import { createLogger } from '../../utils/logger'

const logger = createLogger('resize-image')
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
            await processImage1(record)
            await processImage2(record)
            await processImage3(record)
            await processImage4(record)
        }
    }
}
// THUMBNAIL AND POSTERIZE
async function processImage1(record: S3EventRecord) {
    const key = record.s3.object.key
    logger.info('Processing S3 item with key: ', key)
    const response = await s3
        .getObject({
            Bucket: imagesBucketName,
            Key: key
        })
        .promise()

    if (response.Body instanceof Buffer) {
        const body = response.Body; // type narrowed to 'Buffer'
        const image = await Jimp.read(body)
    
        logger.info('Resizing image')
        image.resize(150, Jimp.AUTO)
        image.posterize( 5 );  
        const convertedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG)
    
        logger.info(`Writing image back to S3 bucket: ${vidsBucketName}`)
        await s3
            .putObject({
                Bucket: vidsBucketName,
                Key: `${key}-01.jpeg`,
                Body: convertedBuffer
            })
            .promise()
    } else {
        logger.info('AWS.S3.Body is not an instance of type Buffer')
    }
}
// THUMBNAIL AND COLOR SEPIA
async function processImage2(record: S3EventRecord) {
    const key = record.s3.object.key
    logger.info('Processing S3 item with key: ', key)
    const response = await s3
        .getObject({
            Bucket: imagesBucketName,
            Key: key
        })
        .promise()

    if (response.Body instanceof Buffer) {
        const body = response.Body; // type narrowed to 'Buffer'
        const image = await Jimp.read(body)
    
        logger.info('Resizing image')
        image.resize(150, Jimp.AUTO)
        image.sepia(); 
        const convertedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG)
    
        logger.info(`Writing image back to S3 bucket: ${vidsBucketName}`)
        await s3
            .putObject({
                Bucket: vidsBucketName,
                Key: `${key}-02.jpeg`,
                Body: convertedBuffer
            })
            .promise()
    } else {
        logger.info('AWS.S3.Body is not an instance of type Buffer')
    }
}
// THUMBNAIL AND COLOR GREYSCALE
async function processImage3(record: S3EventRecord) {
    const key = record.s3.object.key
    logger.info('Processing S3 item with key: ', key)
    const response = await s3
        .getObject({
            Bucket: imagesBucketName,
            Key: key
        })
        .promise()

    if (response.Body instanceof Buffer) {
        const body = response.Body; // type narrowed to 'Buffer'
        const image = await Jimp.read(body)
    
        logger.info('Resizing image')
        image.resize(150, Jimp.AUTO)
        image.greyscale();
        const convertedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG)
    
        logger.info(`Writing image back to S3 bucket: ${vidsBucketName}`)
        await s3
            .putObject({
                Bucket: vidsBucketName,
                Key: `${key}-03.jpeg`,
                Body: convertedBuffer
            })
            .promise()
    } else {
        logger.info('AWS.S3.Body is not an instance of type Buffer')
    }
}
// THUMBNAIL AND COLOR INVERT
async function processImage4(record: S3EventRecord) {
    const key = record.s3.object.key
    logger.info('Processing S3 item with key: ', key)
    const response = await s3
        .getObject({
            Bucket: imagesBucketName,
            Key: key
        })
        .promise()

    if (response.Body instanceof Buffer) {
        const body = response.Body; // type narrowed to 'Buffer'
        const image = await Jimp.read(body)
    
        logger.info('Resizing image')
        image.resize(150, Jimp.AUTO)
        image.invert(); 
        const convertedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG)
    
        logger.info(`Writing image back to S3 bucket: ${vidsBucketName}`)
        await s3
            .putObject({
                Bucket: vidsBucketName,
                Key: `${key}-04.jpeg`,
                Body: convertedBuffer
            })
            .promise()
    } else {
        logger.info('AWS.S3.Body is not an instance of type Buffer')
    }
}