import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { BL_generateUploadUrl } from '../../businessLogic/jobs_items'

const logger = createLogger('generate-upload-url')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing new Image: ', event)
  const jobId = event.pathParameters.jobId
  const userId = getUserId(event)
  if (!jobId) {
    logger.error('JobId not provided')
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'JobId not provided.'
      })
    }
  }
  const response = await BL_generateUploadUrl(jobId,userId,event)

  logger.info("Update complete. Presigned URL generated successfully ")
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      "uploadUrl": response.uploadUrl
    })
  }
}