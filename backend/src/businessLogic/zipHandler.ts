import Archiver from 'archiver'
import { Readable } from 'stream'
import path from 'path'
import { createLogger } from '../utils/logger'
import { Jobs_Data_Access } from '../dataLayer/jobs_access_aws'

const jobsDataAccess = new Jobs_Data_Access()
const strLayer = "ZIP-HANDLER"
const logger = createLogger(strLayer)

type S3DownloadStreamDetails = { stream: Readable, filename: string }

interface Zip {
  keys: string[],
  archiveFilePath: string,
  archiveFolderPath: string,
  archiveFormat: Archiver.Format
}

export class ZipHandler {
  keys: string[];
  archiveFilePath: string;
  archiveFolderPath: string;
  archiveFormat: Archiver.Format
  constructor(
      keys: string[], 
      archiveFilePath: string, 
      archiveFolderPath: string, 
      archiveFormat: Archiver.Format,
      private readonly s3bckVIDS = process.env.S3_VIDS) {
    this.keys = keys,
    this.archiveFilePath = archiveFilePath,
    this.archiveFolderPath = archiveFolderPath,
    this.archiveFormat = archiveFormat
  }

  s3DownloadStreams(): S3DownloadStreamDetails[] {
    logger.info("### "+strLayer+" ### Start of s3DownloadStreams ###")
    return this.keys.map((key: string) => {
      return {
        stream: jobsDataAccess.readStream(this.s3bckVIDS, key) as unknown as Readable,
        filename: `${this.archiveFolderPath}\\${path.basename(key)}`,
      }
    })
  }

  async process() {
    logger.info("### "+strLayer+" ### Start of zipping process ###")
    //const { s3StreamUpload, uploaded } = jobsDataAccess.writeStream(this.zipFileName, this.archiveFilePath)
    const retValues = jobsDataAccess.writeStream(this.s3bckVIDS, this.archiveFilePath)
    const s3StreamUpload = retValues[0]
    const uploaded = retValues[1]
    const s3DownloadStreams = this.s3DownloadStreams()

    await new Promise((resolve, reject) => {
      const archive = Archiver(this.archiveFormat)
      archive.on('error', (error: Archiver.ArchiverError) => {
        throw new Error(`${error.name} ${error.code} ${error.message} ${error.path}
      ${error.stack}`)
      })

      logger.info("### "+strLayer+" ### Starting upload of zip File ###")
      s3StreamUpload.on('close', resolve)
      s3StreamUpload.on('end', resolve)
      s3StreamUpload.on('error', reject)

      archive.pipe(s3StreamUpload)
      s3DownloadStreams.forEach((streamDetails: S3DownloadStreamDetails) => archive.append(streamDetails.stream, { name: streamDetails.filename })
      )
      archive.finalize()
    }).catch((error: { code: string; message: string; data: string }) => {
      throw new Error(`${error.code} ${error.message} ${error.data}`)
    })

    await uploaded.promise()
    logger.info("### "+strLayer+" ### End upload of zip File ###")
  }
}

const zipHandler: Function = async (jobId: string, userId: string, event: Zip) => {

  console.time('zipProcess')
  console.log(event)

  // https://stackoverflow.com/q/56188864/2015025
  // Lambda is standalone service that doesn't need to be integrated with API Gateway. queryStringParameters, body, body mapping templates, all of this is specific not to Lambda, but to Lambda - API Gateway integration.
  const { keys, archiveFilePath, archiveFolderPath, archiveFormat } = event

  const zipHandler = new ZipHandler(keys, archiveFilePath, archiveFolderPath, archiveFormat)
  await zipHandler.process()
  const retZipUrl = await jobsDataAccess.updateJobZipURL(jobId,userId)

  const response = {
    "zipUrl": retZipUrl
  }

  console.timeEnd('zipProcess')
  return response
}

export default zipHandler