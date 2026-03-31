import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}) {
  return (
    
  )
}

function ResizablePanel({
  ...props
}) {
  return 
}

function ResizableHandle({
  withHandle,
  className,
  ...props
} ) {
  return (
    div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        
          
        
      )}
    
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
