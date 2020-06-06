import { createLogger } from '../utils/logger'
import { JobItem } from '../models/JobItem'
import { JobStatus } from '../models/JobStatus'
import { Jobs_Data_Access } from '../dataLayer/jobs_access_aws'
import { CreateJobRequest } from '../requests/CreateJobRequest'
import { UpdateJobStatusRequest } from '../requests/UpdateJobStatusRequest'

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
    logger.info("### "+strLayer+" ### End of BL_createJob ###")
    return await jobsDataAccess
        .createJob({
            jobId: createJobRequest.jobId,
            userId: userId,
            createdAt: createJobRequest.createdAt,
            jobName: createJobRequest.jobName,
            jobStatus: JobStatus.created 
        })
}
// UPDATE Functions
/**
 * Update the job status of an specific job of an specific user
 * @param jobId Job Id of Job that will be deleted
 * @param userId specific user id of an user
 * @param updateJobStatusRequest 
 * @returns JobItem, the updatem Job as a JobItem
 */
export async function BL_updateJobStatus(jobId: string, userId: string, updateJobStatusRequest: UpdateJobStatusRequest): Promise<JobItem> {
    logger.info("### "+strLayer+" ### Starting BL_updateJobStatus ###")
    const element = {
        jobStatus: updateJobStatusRequest.jobStatus
    }
    logger.info("### "+strLayer+" ### End of BL_updateJobStatus ###")
    return await jobsDataAccess.updateJobStatus(jobId,userId,element) 
}
// DELETE Functions
/**
 * Delete a job of an user
 * @param jobId Job Id of Job that will be deleted
 * @param userId specific user id of an user
 * @returns boolean, true= job deleted, false=job NOT deleted
 */
export async function BL_deleteJob(jobId: string, userId: string): Promise<boolean> {
    logger.info("### "+strLayer+" ### Starting BL_deleteJob ###")

    logger.info("### "+strLayer+" ### End of BL_deleteJob ###")
    return await jobsDataAccess.deleteJob(jobId, userId)
}
// GENERATE Functions
export async function BL_generateUploadUrl(jobId: string, userId: string, event: any): Promise<any> {
    logger.info("### "+strLayer+" ### Starting BL_generateUploadUrl ###")
    const signedUrl = await jobsDataAccess.getUploadUrl(jobId,event)
    logger.info("### "+strLayer+" ### The signed URL is "+signedUrl)
    const resUpd = await jobsDataAccess.updateJobImgURL(jobId,userId)
 
    logger.info("### "+strLayer+" ### End of BL_generateUploadUrl ###")
    return {updJobItem: resUpd, uploadUrl: signedUrl} 
}

export async function BL_convertJob(jobId: string, userId: string): Promise<any> {
    logger.info("### "+strLayer+" ### Starting BL_convertJob ###")
    const resUpd = await jobsDataAccess.updateJobVidURLs(jobId, userId)
    logger.info("### "+strLayer+" ### End of BL_convertJob ###")
    return {URLs_created: resUpd} 
}