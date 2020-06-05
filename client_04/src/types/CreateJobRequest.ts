/**
 * Fields in a request to create a single JOB item.
 */
export interface CreateJobRequest {
  jobId: string,
  jobName: string,
  createdAt: string
}