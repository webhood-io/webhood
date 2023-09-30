import * as React from "react"
import { useState } from "react"
import { cva, VariantProps } from "class-variance-authority"

import { cn, copyToClipboard } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button, ButtonProps, buttonVariants } from "@/components/ui/button"

export interface IconButtonProps extends ButtonProps {
  isLoading?: boolean
  icon: React.ReactNode
  children?: React.ReactNode
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, isLoading, icon, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        <div className={"flex flex-row items-center gap-1"}>
          {children}
          {isLoading ? (
            <Icons.loader className="h-4" />
          ) : (
            <div className="h-4">{icon}</div>
          )}
        </div>
      </button>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton }
