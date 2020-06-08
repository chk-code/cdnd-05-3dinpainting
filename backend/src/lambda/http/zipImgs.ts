import 'source-map-support/register'
import Archiver from 'archiver';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import zipHandler from '../../businessLogic/zipHandler'

const logger = createLogger('zipping-job')

interface Zip {
    keys: string[];
    archiveFilePath: string;
    archiveFolderPath: string;
    archiveFormat: Archiver.Format;
  }

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const jobId = event.pathParameters.jobId
  const userId = getUserId(event)
  
  if (!jobId){
    logger.info('Job Id not provided.')
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Job Id not provided.'
      })
    }
  }
  // Patch
  logger.info("Request from "+userId+" for zipping Job "+jobId)
  
  const keys = [
      jobId+"-01.jpg",
      jobId+"-02.jpg",
      jobId+"-03.jpg",
      jobId+"-04.jpg"
    ]
  const zipJob: Zip = {
      keys: keys,
      archiveFilePath: "archive_"+jobId+".zip",
      archiveFolderPath: "",
      archiveFormat: "zip"
  }

  const updZip = await zipHandler(jobId, userId,zipJob)

  logger.info("Zipping of Job Item succeeded: "+userId, updZip)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      "zipUrl": updZip.zipUrl})
  }
}