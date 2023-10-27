import { imageLoader } from "@/lib/utils"
import Image from "next/image"
import { Icons } from "./icons"
import { useToken } from "@/hooks/use-file"

export function ImageFileComponent({fileName, document, alt, ...props}) {
    const {token} = useToken()
    return(
        <Image
            src={fileName}
            alt={alt}
            loader={(props) => imageLoader(props, document, token)}
            {...props}
    />
    )
}