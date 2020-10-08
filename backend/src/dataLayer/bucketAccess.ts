import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { BucketPoint } from '../models/BucketPoint'
//import { join } from 'path'
import { UpdateAttachmentRequest } from '../requests/UpdateAttachmentRequest'
import { BucketPointUpdate } from '../models/BucketPointUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('DataLayer')


export class BucketPointAccess {

  constructor(
    private readonly docClient: DocumentClient =  new XAWS.DynamoDB.DocumentClient(),
    private readonly bucketTable = process.env.BUCKET_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX
) {
  }

  async getBucketList(userid:string): Promise<BucketPoint[]> {
    console.log('Getting all BucketPoints')


    const result = await this.docClient.query({
      TableName: this.bucketTable,
      IndexName: this.userIdIndex,
      KeyConditionExpression: 'userId= :userId',
      ExpressionAttributeValues: {':userId':userid}
    }).promise()

    const items = result.Items
    return items as BucketPoint[]
  }


  async createBucketPoint(bucketPoint: BucketPoint): Promise<BucketPoint> {
    await this.docClient.put({
      TableName: this.bucketTable,
      Item: bucketPoint
    }).promise()

    return bucketPoint
  }

  async deleteBucketPoint(pointId: String, userId: String){
    await this.docClient.delete({
      TableName: this.bucketTable,
      Key:{userId: userId,
      pointId: pointId}
    }).promise()
  }

  async updateItemAttachment(pointId: String, userId: String, attachment: UpdateAttachmentRequest){
    await this.docClient.update({
      TableName: this.bucketTable,
      Key:{userId: userId,
      pointId: pointId},
      UpdateExpression: "SET attachmentUrl = :attachment", 
      ExpressionAttributeValues: {
        ":attachment": attachment.attachmentUrl
      }
    }).promise()
  }

  async updatebucketPoint(pointId: String, userId: String, BucketPointUpdate: BucketPointUpdate ){
    logger.info('updateToDo', {
      Data: {
        pointId,
        userId,
        BucketPointUpdate
      }
    })
    await this.docClient.update({
      TableName: this.bucketTable,
      Key:{userId: userId,
      pointId: pointId},
      UpdateExpression: "SET #title = :name, dueDate = :dueDate, done = :done", 
      ExpressionAttributeValues: {
        ":name": BucketPointUpdate.name,
        ":dueDate": BucketPointUpdate.dueDate,
        ":done": BucketPointUpdate.done
      },
      ExpressionAttributeNames: {
        "#title": "name"
      }
    }).promise()
  }
}

