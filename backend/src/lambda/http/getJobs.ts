import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { BL_getJobItems } from '../../businessLogic/jobs_items'

const logger = createLogger('get-todos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // DONE: Get all Job items for a current user
  logger.info('Processing event: ', event)
  const userId = getUserId(event)
  logger.info("Get ToDos for user : " + userId + " !", event)
  const jobItems = await BL_getJobItems(userId)
  logger.info('Return Todos: ', jobItems)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items: jobItems
    })
  }
}