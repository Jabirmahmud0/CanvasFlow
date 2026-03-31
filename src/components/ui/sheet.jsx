import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet({ ...props }) {
  return 
}

function SheetTrigger({
  ...props
}) {
  return 
}

function SheetClose({
  ...props
}) {
  return 
}

function SheetPortal({
  ...props
}) {
  return 
}

function SheetOverlay({
  className,
  ...props
}) {
  return (
    
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
} ) {
  return (
    
      
      
        {children}
        
          
          Close
        
      
    
  )
}

function SheetHeader({ className, ...props }) {
  return (
    
  )
}

function SheetFooter({ className, ...props }) {
  return (
    
  )
}

function SheetTitle({
  className,
  ...props
}) {
  return (
    
  )
}

function SheetDescription({
  className,
  ...props
}) {
  return (
    
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
