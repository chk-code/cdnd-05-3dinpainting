import { createLogger } from '../utils/logger'
import { JobItem } from '../models/JobItem'
import { JobStatus } from '../models/JobStatus'
import { Jobs_Data_Access } from '../dataLayer/jobs_access_aws'
import { CreateJobRequest } from '../requests/CreateJobRequest'
import * as uuid from 'uuid'

const jobsDataAccess = new Jobs_Data_Access()
const strLayer = "BUSINESS-LOGIC"
const logger = createLogger(strLayer)

// GET Functions
/**
 * Get Jobs for an user
 * @param userId specific user id of an user
 *
 * @returns all JobItems for the specified user
 */
export async function BL_getJobItems(userId: string): Promise<JobItem[]> {
    logger.info("### "+strLayer+" ### Starting getJobItems for User Id "+ userId +" ###")
    logger.info("### "+strLayer+" ### End of getJobItems ###")
    return await jobsDataAccess.getJobsByUserId(userId)
}
// CREATE Functions
/**
 * Create a job for an user
 * @param createJobRequest JSON of an request (from body)
 * @param userId specific user id of an user
 * @returns all JobItems for the specified user
 */
export async function BL_createJob(createJobRequest: CreateJobRequest, userId: string): Promise<JobItem> {
    logger.info("### "+strLayer+" ### Starting BL_createJob ###")
    const newJobId = uuid.v4()
    logger.info("### "+strLayer+" ### End of BL_createJob ###")
    return await jobsDataAccess
        .createJob({
            jobId: newJobId,
            userId: userId,
            createdAt: createJobRequest.createdAt,
            jobName: createJobRequest.jobName,
            jobStatus: JobStatus.created 
        })
}
// UPDATE Functions
/* export async function updateTodo(todoId: string, userId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoItem> {
    logger.info("### Starting updateTodo ###")
    const element = {
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done
    }
    logger.info("### End of updateTodo ###")
    return await todoDataAccess.updateTodo(todoId,userId,element) 
} */
// DELETE Functions
/* export async function deleteTodo(todoId: string, userId: string): Promise<boolean> {
    logger.info("### Starting deleteTodoItem ###")

    logger.info("### End of deleteTodoItem ###")
    return await todoDataAccess.deleteTodo(todoId, userId)
} */
// GENERATE Functions
/* export async function generateUploadUrl(todoId: string, userId: string, event: any): Promise<any> {
    logger.info("### Starting generateUploadUrl ###")
    const signedUrl = await todoDataAccess.getUploadUrl(todoId,event)
    logger.info("The signed URL is "+signedUrl)
    const resUpd = await todoDataAccess.updateTodoURL(todoId,userId)
 
    logger.info("### End of generateUploadUrl ###")
    return {updTodoItem: resUpd, uploadUrl: signedUrl} 
} */