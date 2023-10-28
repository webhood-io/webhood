import Image from "next/image"
import { useToken } from "@/hooks/use-file"

import { imageLoader } from "@/lib/utils"

export function ImageFileComponent({ fileName, document, alt, ...props }) {
  const { token } = useToken()
  return (
    <Image
      src={fileName}
      alt={alt}
      loader={(props) => imageLoader(props, document, token)}
      {...props}
    />
  )
}
