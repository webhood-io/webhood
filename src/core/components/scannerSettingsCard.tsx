import * as React from "react"
import { scannersFetcher } from "@/hooks/use-api"
import { useStatusMessage } from "@/hooks/use-statusmessage"
import { useToast } from "@/hooks/use-toast"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu"
import { ScannersRecord, ScannersResponse } from "@webhood/types"
import { CirclePlus, CloudCog, RefreshCcw, X } from "lucide-react"
import useSWR, { useSWRConfig } from "swr"

import { pb } from "@/lib/pocketbase"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TypographyLarge } from "@/components/ui/typography/large"
import { TypographySubtle } from "@/components/ui/typography/subtle"
import ActionDropdown, { ActionDropdownItem } from "./ActionDropdown"
import { RefreshApiKeyDialog } from "./RefreshApiKeyDialog"
import { ScannerSettingsForm } from "./ScannerSettingsForm"
import { Button } from "./ui/button"
import { Dialog } from "./ui/dialog"
import { DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu"

export function ScannerSettings() {
  const { statusMessage, setStatusMessage } = useStatusMessage()
  const [selectedScanner, setSelectedScanner] = React.useState<
    ScannersResponse | undefined
  >(undefined)
  const {
    data: scanDataSwr,
    error: scanErrorSwr,
    isLoading: isSwrLoading,
    mutate: mutateScanners,
  } = useSWR("/api/scanners", scannersFetcher)

  const { mutate } = useSWRConfig()
  React.useEffect(() => {
    if (scanDataSwr && selectedScanner === undefined) {
      setSelectedScanner(scanDataSwr[0])
    }
  }, [scanDataSwr])

  const handleSubmit = (data: ScannersRecord) => {
    pb.collection("scanners")
      .update(selectedScanner.id, { ...selectedScanner, ...data })
      .then((res) => {
        setStatusMessage({
          status: "success",
          message: "Settings saved",
        })
        mutate("/api/scanners")
      })
      .catch((err) => {
        console.log(err)
        setStatusMessage({
          status: "error",
          message: err,
        })
      })
  }
  const { toast } = useToast()
  const handleCreate = () => {
    pb.collection("scanners")
      .create({})
      .then((newScanner: ScannersResponse) => {
        toast({
          title: "Success",
          description: "New scanner created",
        })
        mutateScanners().then(() => setSelectedScanner(newScanner))
      })
      .catch((e) => {
        toast({
          title: "Failed",
          description: "Could not create a new scanner",
        })
      })
  }
  const handleDelete = (id: string) => {
    pb.collection("scanners")
      .delete(id)
      .then(() => {
        toast({
          title: "Success",
          description: "Deleted scanner",
        })
        mutateScanners().then(() => setSelectedScanner(scanDataSwr[0]))
      })
      .catch(() => {
        toast({
          title: "Failed",
          description: "Could not delete scanner",
        })
      })
  }
  if ((!scanDataSwr || scanDataSwr.length === 0) && !isSwrLoading)
    return (
      <div className="flex flex-col gap-4">
        <p>No scanners found. Add a scanner and start scanning.</p>
        <Button className="w-fit" onClick={handleCreate}>
          Add scanner
        </Button>
      </div>
    )
  if (!selectedScanner) return <div>Loading...</div>
  return (
    <div className="flex flex-col justify-between gap-6">
      <div className="flex flex-row justify-between gap-2">
        <div>
          <TypographyLarge>Scanner settings</TypographyLarge>
          <TypographySubtle>
            Configure settings for your scanners.
          </TypographySubtle>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="max-w-[300px]">
            <Select
              value={selectedScanner.id}
              onValueChange={(value) =>
                setSelectedScanner(scanDataSwr?.find((e) => e.id === value))
              }
            >
              <SelectTrigger className="truncate">
                <SelectValue placeholder="Select a scanner" />
              </SelectTrigger>
              <SelectContent>
                {scanDataSwr?.map((scanner) => (
                  <SelectItem value={scanner.id} className="-z-100">
                    {scanner.name || scanner.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog>
            <ActionDropdown>
              <ActionDropdownItem
                item={{ icon: CirclePlus, label: "New scanner" }}
                onSelect={handleCreate}
              />
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                {selectedScanner.name || selectedScanner.id}
              </DropdownMenuLabel>
              {!selectedScanner.isCloudManaged ? (
                <DropdownMenuGroup>
                  <ActionDropdownItem item={{ icon: RefreshCcw, label: "" }}>
                    <DialogTrigger>Refresh auth token</DialogTrigger>
                  </ActionDropdownItem>
                  <ActionDropdownItem
                    item={{ icon: X, label: "Delete" }}
                    onSelect={() => handleDelete(selectedScanner.id)}
                  />
                </DropdownMenuGroup>
              ) : (
                <ActionDropdownItem
                  disabled
                  item={{ icon: CloudCog, label: "Managed by cloud" }}
                />
              )}
            </ActionDropdown>
            <RefreshApiKeyDialog
              id={selectedScanner.id}
              key={selectedScanner.id}
            />
          </Dialog>
        </div>
      </div>
      <ScannerSettingsForm
        scanner={selectedScanner}
        onSubmit={handleSubmit}
        key={selectedScanner.id}
        statusMessage={statusMessage}
      />
    </div>
  )
}
