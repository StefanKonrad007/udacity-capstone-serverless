import { apiEndpoint } from '../config'
import { Point } from '../types/Point';
import { CreateTodoRequest } from '../types/CreateTodoRequest';
import Axios from 'axios'
import { UpdateTodoRequest } from '../types/UpdateTodoRequest';

export async function getBucketList(idToken: string): Promise<Point[]> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/bucketPoint`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Points:', response.data)
  return response.data.items
}

export async function createBucketPoint(
  idToken: string,
  newTodo: CreateTodoRequest
): Promise<Point> {
  const response = await Axios.post(`${apiEndpoint}/bucketPoint`,  JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchBucketPoint(
  idToken: string,
  pointId: string,
  updatedTodo: UpdateTodoRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/bucketPoint/${pointId}`, JSON.stringify(updatedTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteBucketPoint(
  idToken: string,
  pointId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/bucketPoint/${pointId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  pointId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/bucketPoint/${pointId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
