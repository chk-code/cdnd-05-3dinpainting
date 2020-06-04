/**
 * Fields in a request to update status of a single JOB item.
 */
export interface UpdateJobStatusRequest {
  jobId: string,
  jobStatus: string
}
