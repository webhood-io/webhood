import { useState } from "react"

import { pb } from "@/lib/pocketbase"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function RefreshApiKeyDialog({ id }: { id: string }) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<null | string>(null)
  const [token, setToken] = useState<string | null>(null)
  const onSubmit = async () => {
    setToken(null)
    setIsSubmitting(true)
    pb.send(`/api/beta/admin/scanner/${id}/token`, {
      method: "POST",
    })
      .then((data) => {
        setToken(data.token)
        if (error) setError(null)
      })
      .catch((error) => {
        setError(error.message || error)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Refresh token</DialogTitle>
        <DialogDescription>
          Refreshing a token will invalidate the current token and generate a
          new one.
        </DialogDescription>
      </DialogHeader>
      {error && (
        <DialogDescription className="text-red-500">
          Error: {error}
        </DialogDescription>
      )}
      {token && (
        <DialogDescription>
          Here is your new token:
          <Input
            value={token}
            readOnly
            className="w-full"
            onClick={(e) => {
              e.currentTarget.select()
            }}
          />
          The token will not be shown again.
        </DialogDescription>
      )}
      <DialogFooter>
        <Button
          type="submit"
          variant={"destructive"}
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          Refresh token
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
