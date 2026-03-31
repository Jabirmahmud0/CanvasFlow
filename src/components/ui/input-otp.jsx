import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function InputOTP({
  className,
  containerClassName,
  ...props
} ) {
  return (
    
  )
}

function InputOTPGroup({ className, ...props }) {
  return (
    
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
} ) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    
      {char}
      {hasFakeCaret && (
        
          
        
      )}
    
  )
}

function InputOTPSeparator({ ...props }) {
  return (
    
      
    
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
