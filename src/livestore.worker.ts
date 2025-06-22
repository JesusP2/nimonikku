import { makeWorker } from '@livestore/adapter-web/worker'
import { makeCfSync } from '@livestore/sync-cf'
import { schema } from '@/server/livestore/schema'

makeWorker({
  schema,
  sync: {
    backend: makeCfSync({ url: '/' }),
    initialSyncOptions: { _tag: 'Blocking', timeout: 5000 },
  },
})
