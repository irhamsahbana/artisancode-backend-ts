import cors from 'cors'

const corsOpts = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}

const corsMiddleware = cors(corsOpts)

export default corsMiddleware
