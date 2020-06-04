/**
 * Fields in a request to update vids of a single JOB item.
 */
export interface UpdateJobVidsRequest {
    jobId: string,
    jobStatus: string,
    vidUrl_01: string,
    vidUrl_02: string,
    vidUrl_03: string,
    vidUrl_04: string
  }
  