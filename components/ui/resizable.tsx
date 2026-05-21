'use client'

// @ts-nocheck
// react-resizable-panels does not export these types directly in v4
// This component is currently unused in the project

import * as React from 'react'
import { GripVerticalIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

// Placeholder components - not currently used
function ResizablePanelGroup({
  className,
  ...props
}: any) {
  return null
}

function ResizablePanel({
  ...props
}: any) {
  return null
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: any) {
  return null
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
