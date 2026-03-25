'use client'

import { useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useStories, useStoryConnections } from '@/hooks/use-stories'
import { StoryNode } from '@/components/canvas/story-node'
import { Loader2, LayoutGrid } from 'lucide-react'

const nodeTypes = {
  story: StoryNode,
}

export default function CanvasPage() {
  const { data: stories, isLoading: storiesLoading } = useStories()
  const { data: connections, isLoading: connectionsLoading } = useStoryConnections()

  const initialNodes = useMemo(() => {
    if (!stories) return []
    return stories.map((story, i) => {
      const pos = story.canvas_position || {
        x: Math.cos((i / stories.length) * Math.PI * 2) * 400 + 500,
        y: Math.sin((i / stories.length) * Math.PI * 2) * 400 + 500,
      }
      return {
        id: story.id,
        type: 'story' as const,
        position: { x: pos.x, y: pos.y },
        data: story as unknown as Record<string, unknown>,
      }
    })
  }, [stories])

  const initialEdges = useMemo(() => {
    if (!connections) return []
    return connections.map((conn) => ({
      id: conn.id,
      source: conn.from_story_id,
      target: conn.to_story_id,
      type: 'smoothstep',
      animated: true,
      style: {
        stroke:
          conn.connection_type === 'reply'
            ? '#ff2d78'
            : conn.connection_type === 'weave'
              ? '#00d4ff'
              : '#b44dff',
        strokeWidth: 2,
      },
    }))
  }, [connections])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const isLoading = storiesLoading || connectionsLoading

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-shake-neon-pink" />
      </div>
    )
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center text-center px-6">
        <LayoutGrid className="h-12 w-12 text-shake-text-muted" />
        <h2 className="mt-4 text-lg font-medium">Canvas wird geladen...</h2>
        <p className="mt-1 text-sm text-shake-text-muted">
          Sobald genug Stories da sind, entsteht hier eine interaktive Kollage aller
          Erinnerungen.
        </p>
      </div>
    )
  }

  return (
    <div className="h-dvh w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        className="bg-shake-black"
      >
        <Background color="#1e1e1e" gap={40} size={1} />
        <Controls
          className="[&>button]:!bg-shake-dark [&>button]:!border-shake-light [&>button]:!text-shake-text"
        />
        <MiniMap
          nodeColor="#ff2d78"
          maskColor="rgba(10, 10, 10, 0.8)"
          className="!bg-shake-dark !border-shake-light"
        />
      </ReactFlow>
    </div>
  )
}
