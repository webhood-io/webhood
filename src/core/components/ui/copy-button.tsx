import * as React from "react"
import { useState } from "react"
import { cva, VariantProps } from "class-variance-authority"

import { cn, copyToClipboard } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button, ButtonProps, buttonVariants } from "@/components/ui/button"

export interface CopyButtonProps extends ButtonProps {}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    const [isCopied, setIsCopied] = useState(false)
    const onClick = (value) => {
      setIsCopied(true)
      copyToClipboard(props.value as string)
      setTimeout(() => setIsCopied(false), 1000)
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        {isCopied ? (
          <Icons.check className="h-4 w-4" />
        ) : (
          <Icons.copy className="h-4 w-4" />
        )}
      </button>
    )
  }
)
CopyButton.displayName = "CopyButton"

export { CopyButton }
