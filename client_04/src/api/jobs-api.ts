import { apiEndpoint } from '../config'
import { Job } from '../types/Job';
import { CreateJobRequest } from '../types/CreateJobRequest';
import Axios from 'axios'
import { UpdateJobStatusRequest } from '../types/UpdateJobStatusRequest';

export async function getJobs(idToken: string): Promise<Job[]> {
  console.log('Fetching Jobs')

  const response = await Axios.get(`${apiEndpoint}/jobs`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Jobs:', response.data)
  return response.data.items
}

export async function createJob(
  idToken: string,
  newJob: CreateJobRequest
): Promise<Job> {
  const response = await Axios.post(`${apiEndpoint}/jobs`,  JSON.stringify(newJob), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchJob(
  idToken: string,
  JobId: string,
  updatedJob: UpdateJobStatusRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/jobs/${JobId}`, JSON.stringify(updatedJob), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteJob(
  idToken: string,
  JobId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/jobs/${JobId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  JobId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/jobs/${JobId}/uploadimg`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function convertJob(
  idToken: string,
  JobId: string
): Promise<void> {
  const response = await Axios.post(`${apiEndpoint}/jobs/${JobId}/convert`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
