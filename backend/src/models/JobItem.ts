/**
 * Fields of a single JOB item.
 */
export interface JobItem {
  userId: string
  jobId: string
  createdAt: string
  jobName: string
  jobStatus: string
  imgUrl?: string
  vidUrl_01?: string
  vidUrl_02?: string
  vidUrl_03?: string
  vidUrl_04?: string
}
