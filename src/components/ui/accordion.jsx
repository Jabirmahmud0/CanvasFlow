import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}) {
  return 
}

function AccordionItem({
  className,
  ...props
}) {
  return (
    
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}) {
  return (
    
      svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        
      
    
  )
}

function AccordionContent({
  className,
  children,
  ...props
}) {
  return (
    
      {children}
    
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
