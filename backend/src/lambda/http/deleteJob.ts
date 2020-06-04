import 'source-map-support/register'
import { getUserId } from '../utils'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { BL_deleteJob } from '../../businessLogic/jobs_items'

const logger = createLogger('delete-todo')

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
  logger.info("Deleting Job Item "+jobId)
  const deleted = await BL_deleteJob(jobId,userId)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    // Deleted item info
    body: JSON.stringify({item_deleted: deleted})
  }
}