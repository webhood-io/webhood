import { createContext, useState } from "react"

export const FileTokenContext = createContext({
  token: null,
  setToken: null,
  isLoading: false,
  setIsLoading: null,
})

export function FileTokenProvider({ children }) {
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <FileTokenContext.Provider
      value={{ token, setToken, isLoading, setIsLoading }}
    >
      {children}
    </FileTokenContext.Provider>
  )
}
