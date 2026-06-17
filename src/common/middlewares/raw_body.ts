import { Context, Next } from 'hono'

export const rawBody = async (c: Context, next: Next) => {
  const clone = c.req.raw.clone()
  const text = await clone.text()
  c.set('rawBody', text)
  await next()
}
