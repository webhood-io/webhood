import { useEffect } from "react"

import { pb } from "@/lib/pocketbase"

export function useSubscription(
  collection: string,
  selector: string,
  update: () => void
) {
  useEffect(() => {
    // subscribe to changes in scan. on return, cleanup
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
