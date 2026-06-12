import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import type { S3Config } from './client'

export async function upload(
  config: S3Config,
  client: import('@aws-sdk/client-s3').S3Client,
  req: { key: string; body: Buffer | ReadableStream; contentType: string },
): Promise<{ url: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: req.key,
    Body: req.body,
    ContentType: req.contentType,
  })

  await client.send(command)

  const url = config.publicBaseUrl
    ? `${config.publicBaseUrl}/${req.key}`
    : await getSignedUrl(client, command, { expiresIn: 3600 })

  return { url, key: req.key }
}
