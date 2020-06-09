import { apiEndpoint } from '../config'
import { Job } from '../types/Job';
import { CreateJobRequest } from '../types/CreateJobRequest';
import Axios from 'axios'
import { UpdateJobStatusRequest } from '../types/UpdateJobStatusRequest';

Axios.defaults.timeout = 5000

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

export async function getZipUrl(
  idToken: string,
  JobId: string,
  zipped: boolean
): Promise<string> {
  console.log('### START OF GETZIPURL ###')
  const s3bckVIDS = "sls-3dinpainting-app-vids-dev"
  if(zipped){ 
    console.log('### GETZIPURL ### Already zipped ###')
    return "https://"+s3bckVIDS+".s3.amazonaws.com/archive_"+JobId+".zip"
  }

  await Axios.post(`${apiEndpoint}/jobs/${JobId}/zip`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  }).then(response => { 
    console.log('### GETZIPURL ### Success ###')
    console.log(response)
    return response.data.zipUrl
  })
  .catch(error => {
    console.log('### GETZIPURL ### Error ###')
    console.log(error.response.data)
  })
  return ""
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

export async function getDownload(downloadUrl: string): Promise<void> {
  let urlArray = downloadUrl.split("/")
  let key = `${urlArray[3]}`
  await Axios.get(downloadUrl,
    {
        responseType: 'arraybuffer',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/zip'
        }
    })
    .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', key); //or any other extension
        document.body.appendChild(link);
        link.click();
    })
    .catch((error) => console.log(error));
}


