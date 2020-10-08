/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateBucketPointRequest {
  name: string
  dueDate: string
  done: boolean
}