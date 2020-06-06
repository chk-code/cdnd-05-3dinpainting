import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { BL_convertJob } from '../../businessLogic/jobs_items'

const logger = createLogger('generate-upload-url')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Converting Image: ', event)
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
  const response = await BL_convertJob(jobId, userId)

  logger.info("Convert complete. All new images generated successfully.")
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      "URLs_created": response.created
    })
  }
}