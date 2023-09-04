import { NextApiRequest, NextApiResponse } from "next"

interface CatchErrorsFromInterface {
  (req: NextApiRequest, res: NextApiResponse): Promise<void>
}

export function catchErrorsFrom(handler: CatchErrorsFromInterface) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return handler(req, res).catch((error) => {
      console.error(error)
      return res
        .status(error.statusCode || 500)
        .json({ error: error.message || error.toString() })
    })
  }
}
