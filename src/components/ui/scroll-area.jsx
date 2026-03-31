"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}) {
  return (
    
      
        {children}
      
      
      
    
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return (
    
      
    
  )
}

export { ScrollArea, ScrollBar }
