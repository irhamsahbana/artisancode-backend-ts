import { DeleteObjectCommand } from '@aws-sdk/client-s3'

import type { S3Config } from './client'

export async function deleteFile(
  config: S3Config,
  client: import('@aws-sdk/client-s3').S3Client,
  key: string,
): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: key,
  })

  await client.send(command)
}
