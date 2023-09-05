import * as React from "react"

import { cn } from "@/lib/utils"

export interface ContainerProps {
  className?: string | undefined
  children?: React.ReactNode
}

// TODO: Add a ref to this component, don't know how to add
const Container = React.forwardRef<ContainerProps>(
  ({ className, children, ...props }: ContainerProps, ref) => {
    return (
      <div
        className={cn(
          "container grid auto-rows-max gap-6 pb-8 pt-6 md:py-10",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Container.displayName = "Container"

export { Container }
