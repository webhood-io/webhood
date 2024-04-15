import { ForwardRefExoticComponent } from "react"
import { EllipsisVertical, LucideProps } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ActionDropdown({ children }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

export type ActionDropdownItemType = {
  label: string
  icon: ForwardRefExoticComponent<LucideProps>
}

export function ActionDropdownItem({
  item,
  onSelect,
  disabled,
  children,
}: {
  item: ActionDropdownItemType
  onSelect?: () => void
  disabled?: boolean
  children?: React.ReactElement
}) {
  return (
    <DropdownMenuItem onSelect={onSelect} disabled={disabled}>
      <item.icon className="mr-2 h-4 w-4" />
      <span>{item.label}</span>
      {children}
    </DropdownMenuItem>
  )
}
