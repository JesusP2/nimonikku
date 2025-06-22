import { useStore } from '@livestore/react'
import React from 'react'

import { uiState$ } from '@/lib/livestore/queries'
import { events } from '@/server/livestore/schema'

export const Header: React.FC = () => {
  const { store } = useStore()
  console.log(store.sessionId, store.storeId, store.clientId, store.clientSession)
  const { newTodoText } = store.useQuery(uiState$)

  const updatedNewTodoText = (text: string) => store.commit(events.uiStateSet({ newTodoText: text }))

  const todoCreated = () =>
    store.commit(
      events.todoCreated({ id: crypto.randomUUID(), text: newTodoText }),
      events.uiStateSet({ newTodoText: '' }),
    )

  return (
    <header className="header bg-blue-100">
      <h1>TodoMVC</h1>
      <input
        className="bg-red-300"
        placeholder="What needs to be done?"
        autoFocus={true}
        value={newTodoText}
        onChange={(e) => updatedNewTodoText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            todoCreated()
          }
        }}
      ></input>
    </header>
  )
}
