import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const strLayer = "DATA-LAYER"
const logger = createLogger(strLayer)

const XAWS = AWSXRay.captureAWS(AWS) 
/* const s3 = new XAWS.S3({
  signatureVersion: 'v4'
}) */

import { JobItem } from '../models/JobItem'

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
    /* async getUploadUrl(todoId: string, event: any): Promise<string> {
        logger.info("### Starting getUploadUrl ###")
        const signedURL = await s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: parseInt(this.urlExpiration)
        })
        await this.createImage(todoId,event)
        logger.info("### End of generateUploadUrl ###")
        return signedURL
    } */
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
   /*  async createImage(todoId: string, event: any) {
        const timestamp = new Date().toISOString()
        const newImage = JSON.parse(event.body)
        const imageId = todoId
        const newImgItem = {
          todoId,
          timestamp,
          imageId,
          ...newImage,
          imageUrl: `https://${this.bucketName}.s3.amazonaws.com/${imageId}`
        }
        logger.info('Storing new Image item in Image DB: ', newImgItem)
        await this.docClient.put({
            TableName: this.attImgsTable,
            Item: newImgItem
          }).promise()
    } */
    // UPDATE Functions
    /* async updateTodo(todo_Id: string, user_Id: string, updateTodo: any): Promise<TodoItem> {
        logger.info("### Starting updateTodo ###")
        const tblKey = {
          userId: user_Id,
          todoId: todo_Id          
        }
        const resUpd = await this.docClient.update({
            TableName: this.todoTable,
            Key: tblKey,
            UpdateExpression: 'set #n = :n, #dD = :dD, #d = :d',
            ExpressionAttributeNames: {
                '#n' : 'name',
                '#dD' : 'dueDate',
                '#d' : 'done',
              },
            ExpressionAttributeValues:{
              ':n' : updateTodo.name,
              ':dD' : updateTodo.dueDate,
              ':d' : updateTodo.done,
              },
            ReturnValues: "UPDATED_NEW"
          }).promise()  
        logger.info("### End of updateTodo ###")
        return resUpd.$response.data as TodoItem  
    } */
    /* async updateTodoURL(todoId: string, userId: string): Promise<TodoItem> {
        logger.info("### Starting updateTodoURL ###")
        const imgURL = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
        const tblKey = {
          todoId: todoId,
          userId: userId
        }
        const resUpd = await this.docClient.update({
            TableName: this.todoTable,
            Key: tblKey,
            UpdateExpression: 'set attachmentUrl = :attUrl',
            ExpressionAttributeValues:{
              ':attUrl' : imgURL,
              },
            ReturnValues: "UPDATED_NEW"
          }).promise()  
          logger.info("### End of updateTodoURL ###")
        return resUpd.$response.data as TodoItem  
    } */
    // DELETE Functions
    /**
     * Delete in DynamoDB an entry for the specified Job element
     * @param jobId Id of an specific Job Element
     * @param userId an specific ID of an User
     * @returns the identical Job element
    */
    async deleteTodo(jobId: string, userId: string): Promise<boolean> {
        logger.info("### "+strLayer+" ### Starting deleteTodo ###")
        // TODO: Delete also S3 Images and Videos
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
        logger.info("### "+strLayer+" ### End of deleteTodo ###")
        // Return true = Job Item deleted
        return true
    }
    // GENERATE Functions
    // Nothing yet
}