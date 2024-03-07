import { Icons } from "@/components/icons"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function GenericTooltip({ children }: { children: React.ReactNode }) {
  return (
      <Tooltip>
        <TooltipTrigger type="button">
          <Icons.info className="h-4 w-4 text-slate-500" />
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
  )
}
