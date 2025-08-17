import { createORPCClient, onError } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import type { ORPCRouter } from '@/server/orpc'

const link = new RPCLink({
  url: 'http://localhost:5173/api',
  interceptors: [
    onError((error) => {
      console.error(error)
    })
  ],
})

export const client: RouterClient<ORPCRouter> = createORPCClient(link)
