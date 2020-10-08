import * as uuid from 'uuid'

import { BucketPoint } from '../models/BucketPoint'
import { BucketPointAccess } from '../dataLayer/bucketAccess'
import { CreateBucketPointRequest } from '../requests/CreateBucketPointRequest'
import { parseUserId } from '../auth/utils'
import { UpdateAttachmentRequest} from '../requests/UpdateAttachmentRequest'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import { BucketPointUpdate } from '../models/BucketPointUpdate'

const logger = createLogger('todo_businessLogic')



const bucketAccess = new BucketPointAccess()
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({signatureVersion: "v4"})



export async function getBucketList(jwtToken): Promise<BucketPoint[]> {
  // const userId = parseUserId(jwtToken)
  // return todoAccess.getAllToDo(userId)

  let items = await bucketAccess.getBucketList(parseUserId(jwtToken))
  for (let item of items) {
     
      if(item['attachmentUrl']) {
          item['attachmentUrl'] = signedUrl(item['attachmentUrl'])
      }
  }   
  return items
}

export async function createBucketPoint(
  createBucketPointRequest: CreateBucketPointRequest,
  jwtToken: string
): Promise<BucketPoint> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)
  
  return await bucketAccess.createBucketPoint({
    userId: userId,
    pointId: itemId,
    createdAt: new Date().toISOString(),
    name: createBucketPointRequest.name,
    category: createBucketPointRequest.category,
    dueDate: createBucketPointRequest.dueDate,
    done: false,
  })
}
export async function deleteBucketPoint(pointId, jwtToken){
  //console.log('todo businesslogic ...pointId ist : ' + pointId + '- userid ist: ' + jwtToken)
  logger.info('deleteBucketPoint', {
    Data: {
      pointId,
      jwtToken
    }
  })
  
  const userId = parseUserId(jwtToken)
  return bucketAccess.deleteBucketPoint(pointId, userId)
  
}

export async function updateBucketPointAttachment(
  itemId:string,
  updatedItem: UpdateAttachmentRequest,
  jwt:string) {
      const userId = parseUserId(jwt)

      return await bucketAccess.updateItemAttachment(itemId, userId, updatedItem) 

}

export function signedUrl (attachment:string) {

  return s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: attachment,
      Expires: urlExpiration,
  })
}

export async function updateBucketPoint(BucketListUpdate: BucketPointUpdate, jwtToken, pointId ){
  const userId = parseUserId(jwtToken)
  await bucketAccess.updatebucketPoint(pointId, userId, BucketListUpdate)
  logger.info('updateToDoBusniessLogic', {
    Data: {
      pointId,
      jwtToken,
      BucketListUpdate
    }
  })
}