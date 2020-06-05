import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { UpdateJobStatusRequest } from '../../requests/UpdateJobStatusRequest'
import { BL_updateJobStatus } from '../../businessLogic/jobs_items'
const logger = createLogger('update-job')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const jobId = event.pathParameters.jobId
  const userId = getUserId(event)
  const updatedJobStatus: UpdateJobStatusRequest = JSON.parse(event.body)
  
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
  logger.info("Request from "+userId+" for updating Job "+jobId)
  const updItem = await BL_updateJobStatus(jobId, userId, updatedJobStatus)

  logger.info("Update of Job Item succeeded: "+userId, updItem)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({item: updItem})
  }
}