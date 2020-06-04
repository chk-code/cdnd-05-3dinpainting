import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateJobRequest } from '../../requests/CreateJobRequest'
import { getUserId } from "../utils"
import { createLogger } from '../../utils/logger'
import { BL_createJob } from '../../businessLogic/jobs_items'

const logger = createLogger('create-job')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Creating new Job: ', event)
  const crJob: CreateJobRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  logger.info(`Request from ${userId} for new Job ${crJob.jobName}`)

  // Writing new Job to DynamoDB
  logger.info('Writing new Job to Table...')
  const newJob = await BL_createJob(crJob, userId)
  logger.info("Writing new Job to Table...done!",newJob)
  // Returning new Job item and status code 201
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    // Use item: newTodo format for the frontend
    body: JSON.stringify({item: newJob})
  }
}
