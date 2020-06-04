import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
// import { updateTodo } from '../../businessLogic/jobs_items'
// import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
const logger = createLogger('update-todo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const jobId = event.pathParameters.jobId
  const userId = getUserId(event)
  /* const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  
  // DONE: Update a TODO item with the provided id using values in the "updatedTodo" object
  if (!todoId){
    logger.info('Item Id not provided.')
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Item Id not provided.'
      })
    }
  }
  logger.info('Patching Todo Item: ')
  // Patch
  logger.info("Request from "+userId+" for updating Todo "+todoId)
  const updItem = await updateTodo(todoId, userId, updatedTodo)
 */
  logger.info("Update of Todo Item succeeded: "+userId, jobId)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({item: jobId})
  }
}