import { useEffect } from "react"

import { pb } from "@/lib/pocketbase"

/**
 * Subscribe to changes in a collection using Pocketbase
 * @param collection - the collection to subscribe to, e.g. "scans"
 * @param selector - the selector to use, e.g. "scanId"
 * @param update - the function to call when the collection changes
 * @returns void
 * @example
 * ```tsx
 * useSubscription("scans", scanItem?.id, () => mutate({ slug: scanId }))
 * ```
 * @see {@link https://pocketbase.io/docs/api-realtime}
 */
export function useSubscription(
  collection: string,
  selector: string,
  update: () => void
)
 {
  useEffect(() => {
    // subscribe to changes in scan. on return, cleanup
    if (!selector) return
    const prom = pb.collection(collection).subscribe(selector, async () => {
      update()
    })
    return () => {
      prom
        .then((sub) => {
          sub()
        })
        .catch((e) => {
          console.error("error unsubscribing", e)
        })
    }
  }, [selector])
}
