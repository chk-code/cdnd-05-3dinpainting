import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { Stream } from 'stream'
import { createLogger } from '../utils/logger'

const strLayer = "DATA-LAYER"
const logger = createLogger(strLayer)
const ARCHIVE_CONTENT_TYPE = 'application/zip'

const XAWS = AWSXRay.captureAWS(AWS) 
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

import { JobItem } from '../models/JobItem'
import { JobStatus } from '../models/JobStatus'

export class Jobs_Data_Access{
    /**
     * Standard Constructor for initializing the environment variables
     */
    constructor(
        //AWS 
        private readonly docClient = new XAWS.DynamoDB.DocumentClient(),
        //Tables
        private readonly jobsTable = process.env.JOBS_TABLE,
        private readonly idxJobsJobId = process.env.IDX_JOBS_JOBID,
        private readonly idxJobsUserId = process.env.IDX_JOBS_USERID,
        // private readonly idxJobsName = process.env.IDX_JOBS_NAME
        //S3
        private readonly countVids = 4,
        private readonly s3bckIMGS = process.env.S3_IMGS,
        private readonly s3bckVIDS = process.env.S3_VIDS,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
        ){
        }
    
    // GET Functions
    /**
     * Return a specific Job element by asking with jobId
     * @param jobId an specific ID of a Job
     *
     * @returns the requested Job element
    */
    async getJobByJobId(jobId: string): Promise<JobItem> {
        logger.info("### "+strLayer+" ### Starting getJobByJobId ###")
        const getRes = await this.docClient.query({
            TableName: this.jobsTable,
            IndexName: this.idxJobsJobId,
            KeyConditionExpression: '#JID = :jid ',
            ExpressionAttributeNames: {'#JID' : 'jobId'},
            ExpressionAttributeValues:{':jid' : jobId}
        }).promise()

        if (getRes.Count == 0){
          logger.error("### "+strLayer+" ### Found " + getRes.Count + " elements!")
          throw new Error("### "+strLayer+" ### Element not found") 
        }     
        if (getRes.Count > 1){
           logger.error("### "+strLayer+" ### Found " + getRes.Count + " elements!")
           throw new Error("### "+strLayer+" ### jobId is not Unique")
        }
        const item = getRes.Items[0]
        logger.info("### "+strLayer+" ### Found " + getRes.Count + " element!",item)  
                  
        logger.info("### "+strLayer+" ### End of getJobByJobId ###")
        return item as JobItem
    }
    /**
     * Return all Job elements by asking with userId
     * @param userId an specific ID of an User
     *
     * @returns the requested Job elements
    */
    async getJobsByUserId(userId: string): Promise<JobItem[]> {
        logger.info("### "+strLayer+" ### Starting getJobsByUserId for User " +userId+ " ###")
        const getRes = await this.docClient.query({
            TableName: this.jobsTable,
            IndexName: this.idxJobsUserId,
            KeyConditionExpression: '#ID = :uId',
            ExpressionAttributeNames: {'#ID' : 'userId'},
            ExpressionAttributeValues:{':uId' : userId}
        }).promise()

        const items = getRes.Items
        logger.info("### "+strLayer+" ### Found " + getRes.Count + " element(s)!",items) 
        
        logger.info("### "+strLayer+" ### End of getJobsByUserId ###")
        return items as JobItem[]
    }
    /**
     * Return a S3 signed Upload URL for a specific Job Element
     * @param jobId an specific ID of a Job
     * @param event the request event
     * @returns the requested signed URL from S3
    */
    async getUploadUrl(jobId: string, event: any): Promise<string> {
      const filename = jobId+".jpg"  
      logger.info("### "+strLayer+" ### Starting getUploadUrl for JobId "+event.pathParameters.jobId+" ###")
        const signedURL = await s3.getSignedUrl('putObject', {
            Bucket: this.s3bckIMGS,
            Key: filename,
            Expires: parseInt(this.urlExpiration)
        })
        logger.info("### "+strLayer+" ### End of generateUploadUrl ###")
        return signedURL
    }
    /**
     * Get an element of S3 Bucket or the specified Job element
     * @param jobId Id of an specific Job Element
     * @param bucketName an specific S3 bucket
     * @returns the S3 object
    */
   async getImageS3(jobId: string, bucketName: string): Promise<any> {
    const filename = jobId+".jpg" 
    logger.info("### "+strLayer+" ### Starting getImageS3 ###")
    const ret =  await s3.getObject({
      Bucket: bucketName,
      Key: filename
    })
    logger.info("### "+strLayer+" ### Result of getImageS3 ###",ret)
    logger.info("### "+strLayer+" ### End of getImageS3 ###")
    return ret
  }
    // CREATE Functions
    /**
     * Create in DynamoDB a new Entry for the specified Job element
     * @param jobItem an specific Job Element of type JobItem
     *
     * @returns the identical Job element
    */
    async createJob(jobItem: JobItem): Promise<JobItem> {
        logger.info("### "+strLayer+" ### Starting createJob ###")
        const putResult = await this.docClient.put({
            TableName: this.jobsTable,
            Item: jobItem
          }).promise()
        logger.info("### "+strLayer+" ### End of createJob ###", putResult)
        return jobItem
    }

    // UPDATE Functions
    /**
     * Update the Job Status for the specified Job element
     * @param jobId an specific Job Element of type JobItem
     * @param userId an specific ID of an User
     * @param updateJobStatus The data for the update
     * @returns the updated Job element
    */
    async updateJobStatus(jobId: string, userId: string, updateJobStatus: any): Promise<JobItem> {
        logger.info("### "+strLayer+" ### Starting updateJobStatus ###")
        const tblKey = {
          userId: userId,
          jobId: jobId          
        }
        const resUpd = await this.docClient.update({
            TableName: this.jobsTable,
            Key: tblKey,
            UpdateExpression: 'set #js = :jobStat',
            ExpressionAttributeNames: {
                '#js' : 'jobStatus'
              },
            ExpressionAttributeValues:{
              ':jobStat' : updateJobStatus.jobStatus
              },
            ReturnValues: "UPDATED_NEW"
          }).promise()  
        logger.info("### "+strLayer+" ### End of updateJobStatus ###")
        return resUpd.$response.data as JobItem  
    }
    /**
     * Update the image URL for the specified Job element
     * @param jobItem an specific Job Element of type JobItem
     * @param userId an specific ID of an User
     * @returns the updated Job element
    */
    async updateJobImgURL(jobId: string, userId: string): Promise<JobItem> {
        logger.info("### "+strLayer+" ### Starting updateJobImgURL ###")
        const imgURL = `https://${this.s3bckIMGS}.s3.amazonaws.com/${jobId}.jpg`
        const tblKey = {
          jobId: jobId,
          userId: userId
        }
        logger.info("### "+strLayer+" ### Updating DynamoDB after Image Upload ###")
        const resUpd = await this.docClient.update({
            TableName: this.jobsTable,
            Key: tblKey,
            UpdateExpression: 'set imgUrl = :iUrl, jobStatus = :jS',
            ExpressionAttributeValues:{
              ':jS' : JobStatus.img_uploaded,
              ':iUrl' : imgURL,
              },
            ReturnValues: "UPDATED_NEW"
          }).promise()  
        logger.info("### "+strLayer+" ### End of updateJobImgURL ###")
        return resUpd.$response.data as JobItem  
    }
    /**
     * Update the zip URL for the specified Job element
     * @param jobItem an specific Job Element of type JobItem
     * @param userId an specific ID of an User
     * @returns the updated Job element
    */
   async updateJobZipURL(jobId: string, userId: string): Promise<string> {
    logger.info("### "+strLayer+" ### Starting updateJobZipURL ###")
    const zipURL = `https://${this.s3bckVIDS}.s3.amazonaws.com/archive_${jobId}.zip`
    const tblKey = {
      jobId: jobId,
      userId: userId
    }
    logger.info("### "+strLayer+" ### Updating DynamoDB after Zip Request ###")
    const resUpd = await this.docClient.update({
        TableName: this.jobsTable,
        Key: tblKey,
        UpdateExpression: 'set zipUrl = :zUrl',
        ExpressionAttributeValues:{
          ':zUrl' : zipURL,
          },
        ReturnValues: "UPDATED_NEW"
      }).promise()  
    logger.info("### "+strLayer+" ### End of updateJobZipURL ###", resUpd)
    return zipURL 
}
    /**
     * Update the vid URLs for the specified Job element
     * @param jobItem an specific Job Element of type JobItem
     * 
     * @returns true, if function completes
    */
    async updateJobVidURLs(jobId: string, userId: string): Promise<any> {
      logger.info("### "+strLayer+" ### Starting updateJobVidURLs ###")
      const vidURL01 = `https://${this.s3bckVIDS}.s3.amazonaws.com/${jobId}-01.jpg`
      const vidURL02 = `https://${this.s3bckVIDS}.s3.amazonaws.com/${jobId}-02.jpg`
      const vidURL03 = `https://${this.s3bckVIDS}.s3.amazonaws.com/${jobId}-03.jpg`
      const vidURL04 = `https://${this.s3bckVIDS}.s3.amazonaws.com/${jobId}-04.jpg`
      const tblKey = {
        jobId: jobId,
        userId: userId
      }
      logger.info("### "+strLayer+" ### Updating DynamoDB for Video URLs ###")
      await this.docClient.update({
          TableName: this.jobsTable,
          Key: tblKey,
          UpdateExpression: 'set vidUrl_01 = :iV1, vidUrl_02 = :iV2, vidUrl_03 = :iV3, vidUrl_04 = :iV4, jobStatus = :jS',
          ExpressionAttributeValues:{
            ':iV1' : vidURL01,
            ':iV2' : vidURL02,
            ':iV3' : vidURL03,
            ':iV4' : vidURL04,
            ':jS' : JobStatus.done,
            },
          ReturnValues: "UPDATED_NEW"
        }).promise()  
      logger.info("### "+strLayer+" ### End of updateJobVidURLs ###")
      return true
    }
    // DELETE Functions
    /**
     * Delete in DynamoDB an entry for the specified Job element
     * @param jobId Id of an specific Job Element
     * @param userId an specific ID of an User
     * @returns the identical Job element
    */
    async deleteJob(jobId: string, userId: string): Promise<boolean> {
        logger.info("### "+strLayer+" ### Starting deleteJob ###")
        // Delete S3 Images
        if(await this.getImageS3(jobId,this.s3bckIMGS)){
          await this.deleteImageS3(jobId,this.s3bckIMGS)
        }
        // Delete S3 Videos
        for (var _i = 1; _i < this.countVids+1; _i++) {
          let vidfile = "-0"+_i.toString()
          logger.info("### "+strLayer+" ### jobId and vidfile = "+jobId+vidfile+" ###")
          if(await this.getImageS3(jobId+vidfile,this.s3bckVIDS)){
            await this.deleteImageS3(jobId+vidfile,this.s3bckVIDS)
          }
        }      
        const delRes = await this.docClient.delete({
        TableName: this.jobsTable,
        Key:
        {
            userId: userId,
            jobId: jobId
        }
        }).promise()
        if (delRes.$response.error)
        {
            // If error occurs, return FALSE = job Item not deleted
            logger.error(delRes.$response.error)
            return false
        }
        logger.info("### "+strLayer+" ### End of deleteJob ###")
        // Return true = Job Item deleted
        return true
    }
    /**
     * Delete in S3 Bucket an element for the specified Job element
     * @param jobId Id of an specific Job Element
     * @param bucketName an specific S3 bucket
     * @returns true, if deletion completed
    */
    async deleteImageS3(jobId: string, bucketName: string): Promise<boolean> {
      logger.info("### "+strLayer+" ### Starting deleteImageS3 ###")
      const filename = jobId+".jpg"
      let params = {
        Bucket: bucketName, 
        Key: filename
       }
      try {
        await s3.headObject(params).promise()
        logger.info("### "+strLayer+" ### File Found in S3")
        try {
          const respDel = await s3.deleteObject(params).promise()
          logger.info("### "+strLayer+" ### File deleted Successfully", respDel)
        }
        catch (err) {
          logger.error("### "+strLayer+" ### ERROR in file Deleting : " + JSON.stringify(err))
        }
      } catch (err) {
        logger.info("### "+strLayer+" ### File not Found ERROR : " + err.code)
      }
      logger.info("### "+strLayer+" ### End of deleteImageS3 ###")
      return true
    }

    // ZIP Functions
    readStream(bucketName: string, fKey: string) {
      logger.info("### "+strLayer+" ### Starting readStream ###")
      const params = { Bucket: bucketName, Key: fKey }
      logger.info("### "+strLayer+" ### End of readStream ###")
      return s3.getObject(params).createReadStream()
    }
    writeStream(fKey: string) {
      logger.info("### "+strLayer+" ### Starting writeStream for "+this.s3bckVIDS+" and key "+fKey+" ###")

      const streamPassThrough = new Stream.PassThrough()
      logger.info("### "+strLayer+" ### streamPassThrough created ###")
      const params: AWS.S3.PutObjectRequest = {
        ACL: 'private',
        Body: streamPassThrough,
        Bucket: this.s3bckVIDS,
        ContentType: ARCHIVE_CONTENT_TYPE,
        Key: fKey,
      }
      logger.info("### "+strLayer+" ### params created ###")
      
      //const s3StreamUpload = streamPassThrough
      const uploaded = s3.upload(params, (error: Error, resp): void => {
        if (error) {
          logger.error("### "+strLayer+" ### "+`Got error creating stream to s3 ${error.name} ${error.message} ${error.stack}`)
          throw error
        }
        logger.info("### "+strLayer+" ### S3 upload created ###",resp)
      }).on('httpUploadProgress', (progress: { loaded: number; total: number; part: number; key: string }) => {
        logger.info("### "+strLayer+" ### S3 Upload progress",progress); // { loaded: 4915, total: 192915, part: 1, key: 'foo.jpg' }
        })
      logger.info("### "+strLayer+" ### End of writeStream ###")
      return [
        streamPassThrough,
        uploaded 
      ]
    }
}