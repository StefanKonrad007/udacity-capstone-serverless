import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'
import { updateTodoAttachment } from '../../businessLogic/todo'
//import { UpdateTodoAttachmentUrlRequest } from "../../requests/UpdateTodoAttachmentUrlRequest"

const  XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const logger = createLogger('generateUploadUrl')
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

//const region = process.env.AWSREGION


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const imageId = 'img-'+todoId
  //const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${imageId}`
  const signedUrl = getUploadUrl(imageId)
 
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  try {
    
    await updateTodoAttachment(todoId , {attachmentUrl: imageId}, jwtToken)

  } catch(e) {
    logger.error("UpdateAttachment error", {Meta: e})
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true //removed comment
      },
      body: JSON.stringify({
        todoId,
        uploadUrl: signedUrl
      })
    }
  }
  
  logger.info("so far no error occured")

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      todoId,
      uploadUrl: signedUrl,
    })
  }
}


function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration,
  })
}
