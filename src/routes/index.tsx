import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

const interval = 100;

function createStateDiff(state: State, currentState: State) {
  if ('elements' in state) {
    return {
      elements: state.elements,
      appState: state.appState,
      files: state.files,
    };
  }
  return {
    elements: currentState.elements,
    appState: currentState.appState,
    files: currentState.files,
  };
}

async function getState(boardId: string) {
  const board = await dexieDb.board.get(boardId)
  if (!board) {
    throw new Error('Board not found')
  }
  const elements = board.elements;
  const appState = board.appState;
  return {
    elements,
    appState,
  }
}


function RouteComponent() {
  // const { boardId } = useParams({ from: '/' });
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);

  return (
    <div className='h-screen'>
      <Excalidraw
        onChange={async (state) => {
          console.log('excalidraw changed', state);
        }}
        excalidrawAPI={setExcalidrawApi}
      />
    </div>
  );
}
