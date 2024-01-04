import { useCallback, useEffect, useState } from "react"

import {
  ApiTokensResponse,
  ScannersResponse,
  ScansResponse,
  UsersResponse,
} from "@/types/pocketbase-types"
import { pb } from "@/lib/pocketbase"
import { urlWithParams } from "@/lib/utils"

function accountFetcher() {
  return pb.authStore.model
}

function usersFetcher() {
  return pb
    .collection("users")
    .getFullList({
      sort: "-created",
    })
    .then((data) => {
      return data as unknown as UsersResponse[]
    }) as Promise<UsersResponse[]>
}

function scannerFetcher() {
  return pb
    .collection("scanners")
    .getFirstListItem("")
    .then((data) => {
      return data as unknown as ScannersResponse
    }) as Promise<ScannersResponse>
}

function scannersFetcher() {
  return pb
    .collection("scanners")
    .getFullList()
    .then((data) => {
      return data as unknown as ScannersResponse[]
    }) as Promise<ScannersResponse[]>
}

function tokensFetcher() {
  return pb
    .collection("api_tokens")
    .getFullList({
      sort: "-created",
    })
    .then((data) => {
      return data as unknown as ApiTokensResponse[]
    }) as Promise<ApiTokensResponse[]>
}

function tokenSingleFetcher({ id }) {
  return pb
    .collection("api_tokens")
    .getOne(id)
    .then((data) => {
      return data as unknown as UsersResponse
    }) as Promise<UsersResponse>
}

function latestScansFetcher() {
  return pb
    .collection("scans")
    .getList(1, 10, {
      sort: "-created",
    })
    .then((data) => {
      return data.items
    }) as Promise<ScansResponse[]>
}

function scansSearchFetcher({ search, limit, range }) {
  return pb
    .collection("scans")
    .getList((range.end + 1) / limit, limit, {
      filter: `url ~ "${search}"`,
      sort: "-created",
    })
    .then((data) => {
      return data.items
    }) as Promise<ScansResponse[]>
}
function scanSingleFetcher({ slug }) {
  return pb
    .collection("scans")
    .getFirstListItem(`slug="${slug}"`)
    .then((data) => {
      return data as unknown as ScansResponse
    }) as Promise<ScansResponse>
}

export enum AccountErrors {
  NOT_LOGGED_IN = "Not logged in",
  INVALID_LOGON = "INVALID_LOGON",
  INVALID_EMAIL = "INVALID_EMAIL",
  INVALID_PASSWORD = "INVALID_PASSWORD",
  USER_DISABLED = "USER_DISABLED",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  WRONG_PASSWORD = "WRONG_PASSWORD",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
  OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
}

export interface AccountError {
  type: AccountErrors
  message?: string
}

function useAccount() {
  const [data, setData] = useState(null)
  const [error, setError] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    if (pb.authStore.isValid) {
      setData(pb.authStore.model)
    } else {
      setData(null)
      setError({ type: AccountErrors.NOT_LOGGED_IN })
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    let response
    try {
      setError(null)
      setLoading(true)
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password)
        .catch((e) => {
          setError({ type: AccountErrors.INVALID_LOGON, message: e.message })
        })
      response = authData
    } catch (e) {
      response = null
      setError({ type: AccountErrors.INVALID_LOGON, message: e.message })
    } finally {
      setLoading(false)
      setData(response)
    }
    return { response }
  }, [])
  const register = useCallback(async (email, password) => {
    let response
    try {
      setError(null)
      setLoading(true)
      const { data, error } = await pb.collection("users").create({
        email: email,
        password: password,
        passwordConfirm: password,
      })
      response = data
      if (error) setError(error)
    } catch (e) {
      response = null
      setError(e as AccountError)
    } finally {
      setLoading(false)
      setData(response)
    }
    return { response }
  }, [])

  return { data, error, loading, login, register }
}

function useApiv2() {
  async function request(url: string, options) {
    const fetchUrl = urlWithParams(url, options)
    const res = await fetch(fetchUrl, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${pb.authStore.token}`,
      },
    })
    return res.json()
  }
  return { request }
}

export {
  useAccount,
  accountFetcher,
  latestScansFetcher,
  scansSearchFetcher,
  scanSingleFetcher,
  scannerFetcher,
  scannersFetcher,
  usersFetcher,
  tokensFetcher,
  tokenSingleFetcher,
  useApiv2,
}
