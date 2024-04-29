import { useEffect, useRef, useState } from "react"
import { PopoverAnchor } from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"
import { Input } from "./ui/input"
import { Popover, PopoverContent } from "./ui/popover"

interface OperatorResult {
  field: string
  operator: string
  value: string
}

enum OperatorStateOptions {
  field = "field",
  operator = "operator",
  value = "value",
  join = "join",
}

const DataList = ({ values, updateValue, selected }) => {
  return values.map((option, index) => (
    <div
      key={option.value}
      onClick={() => updateValue(option.value)}
      className={cn(
        "cursor-pointer",
        index === selected && " bg-gray-100 text-gray-900"
      )}
    >
      <div className="grid grid-cols-3 items-center">
        <div>
          <div className="m-0.5 w-fit rounded bg-slate-200 px-2 tracking-tighter ">
            {option.value}
          </div>
        </div>
        <div className="col-span-2">{option.label}</div>
      </div>
    </div>
  ))
}

/** Get the 'field = value' as an object */
const getOperator = (value: string): null | OperatorResult => {
  const regex = /([\w\.]+)\s*([~=\?\!<>]+)?\s*(\".+\"|\d+|true|false|@\w+)?/g
  // if three groups, then we have a full operator
  const match = regex.exec(value)
  if (match) {
    return {
      field: match[1],
      operator: match[2],
      value: match[3],
    }
  }
  return null
}

const getOperatorState = (value: string): OperatorStateOptions => {
  const match = getOperator(value)
  if (match) {
    if (!match.field) return OperatorStateOptions.field
    if (!match.operator) return OperatorStateOptions.operator
    if (!match.value) return OperatorStateOptions.value
    return OperatorStateOptions.join
  }
  return OperatorStateOptions.field
}

const splitJoins = (value: string) => {
  // split input value with each join operator
  return value.split(/(\|\||&&)/g)
}

export default function SelectManipulate({ value, setValue }) {
  const [focused, setFocused] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [isOperator, setIsOperator] = useState<OperatorStateOptions>(
    OperatorStateOptions.field
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const updateValue = (newValue: string) => {
    let finalValue = value.trim() + " " + newValue
    if (newValue === '""') {
      inputRef.current.focus()
      inputRef.current.setSelectionRange(1, 5)
    } else {
      updateOperatorState(finalValue)
      inputRef.current.focus()
      finalValue = finalValue + " "
    }
    setValue(finalValue)
  }
  useEffect(() => {
    // if last two characters are "" then go to the middle of the quotes
    if (value.slice(-2) === '""') {
      inputRef.current.focus()
      const position = value.length - 1
      inputRef.current.setSelectionRange(position, position)
      setFocused(false)
    }
    if (value === "") setIsOperator(OperatorStateOptions.field)
  }, [value])
  const getCurrentList = () => {
    if (isOperator === "field") return fields
    if (isOperator === "operator") return OperatorOptions
    if (isOperator === "value") {
      const valueSplit = splitJoins(value)
      const lastValue = valueSplit[valueSplit.length - 1]
      const fieldName = getOperator(lastValue)?.field
      const fieldObject = fields.find((field) => field.value === fieldName)
      if (fieldObject && fieldObject.enum) return fieldObject.enum
      else return values
    }
    if (isOperator === "join") return join
  }
  const updateOperatorState = (newValue: string) => {
    const valueSplit = splitJoins(newValue)
    const lastValue = valueSplit[valueSplit.length - 1]
    setIsOperator(getOperatorState(lastValue))
    if (newValue[newValue.length - 1] === " ") {
      setFocused(true)
    }
  }
  return (
    <Popover open={focused}>
      <PopoverAnchor className="w-full">
        <Input
          name="search-query"
          placeholder="Search for past scan results"
          ref={inputRef}
          onFocus={(e) => {
            setFocused(true)
          }}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            updateOperatorState(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setFocused(false)
            }
            if (e.key === "ArrowDown") {
              e.preventDefault()
              // focus the first item
              if (selected === null) {
                setSelected(0)
              } else if (selected < OperatorOptions.length - 1) {
                setSelected(selected + 1)
              } else {
                setSelected(0)
              }
            }
            if (e.key === "ArrowUp") {
              e.preventDefault()
              if (selected === null) {
                setSelected(OperatorOptions.length - 1)
              } else if (selected > 0) {
                setSelected(selected - 1)
              } else {
                setSelected(OperatorOptions.length - 1)
              }
            }
            if (e.key === "Enter") {
              if (selected !== null) {
                updateValue(getCurrentList()[selected].value)
                setSelected(null)
              }
            }
          }}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="max-w-screen w-fit"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={() => setFocused(false)}
      >
        <div className="text-sm">
          <DataList
            values={getCurrentList()}
            updateValue={updateValue}
            selected={selected}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

/*
= Equal
!= NOT equal
> Greater than
>= Greater than or equal
< Less than
<= Less than or equal
~ Like/Contains (if not specified auto wraps the right string OPERAND in a "%" for wildcard match)
!~ NOT Like/Contains (if not specified auto wraps the right string OPERAND in a "%" for wildcard match)
?= Any/At least one of Equal
?!= Any/At least one of NOT equal
?> Any/At least one of Greater than
?>= Any/At least one of Greater than or equal
?< Any/At least one of Less than
?<= Any/At least one of Less than or equal
?~ Any/At least one of Like/Contains (if not specified auto wraps the right string OPERAND in a "%" for wildcard match)
?!~ Any/At least one of NOT Like/Contains (if not specified auto wraps the right string OPERAND in a "%" for wildcard match)
*/
const OperatorOptions = [
  { value: "~", label: "Like/Contains" },
  { value: "!~", label: "Not Like/Contains" },
  { value: "=", label: "Equals" },
  { value: "!=", label: "Not Equals" },
  { value: ">", label: "Greater Than" },
  { value: ">=", label: "Greater Than or Equals" },
  { value: "<", label: "Less Than" },
  { value: "<=", label: "Less Than or Equals" },
  { value: "?=", label: "Any/At least one of Equals" },
  { value: "?!=", label: "Any/At least one of Not Equals" },
  { value: "?>", label: "Any/At least one of Greater Than" },
  { value: "?>=", label: "Any/At least one of Greater Than or Equals" },
  { value: "?<", label: "Any/At least one of Less Than" },
  { value: "?<=", label: "Any/At least one of Less Than or Equals" },
  { value: "?~", label: "Any/At least one of Like/Contains" },
  { value: "?!~", label: "Any/At least one of Not Like/Contains" },
]

const fields = [
  { value: "url", label: "Input URL" },
  {
    value: "status",
    label: "Status",
    enum: [
      { value: '"done"', label: "Done" },
      { value: '"error"', label: "Error" },
      { value: '"pending"', label: "Pending" },
      { value: '"running"', label: "Running" },
    ],
  },
  { value: "final_url", label: "Final URL" },
  { value: "created", label: "Created At" },
  { value: "done_at", label: "Done at" },
]

/*
// all macros are UTC based
@now        - the current datetime as string
@second     - @now second number (0-59)
@minute     - @now minute number (0-59)
@hour       - @now hour number (0-23)
@weekday    - @now weekday number (0-6)
@day        - @now day number
@month      - @now month number
@year       - @now year number
@todayStart - beginning of the current day as datetime string
@todayEnd   - end of the current day as datetime string
@monthStart - beginning of the current month as datetime string
@monthEnd   - end of the current month as datetime string
@yearStart  - beginning of the current year as datetime string
@yearEnd    - end of the current year as datetime string
*/
const values = [
  { value: '""', label: "String Value" },
  { value: "@now", label: "Current Datetime" },
  { value: "@second", label: "Second" },
  { value: "@minute", label: "Minute" },
  { value: "@hour", label: "Hour" },
  { value: "@weekday", label: "Weekday" },
  { value: "@day", label: "Day" },
  { value: "@month", label: "Month" },
  { value: "@year", label: "Year" },
  { value: "@todayStart", label: "Beginning of the current day" },
  { value: "@todayEnd", label: "End of the current day" },
  { value: "@monthStart", label: "Beginning of the current month" },
  { value: "@monthEnd", label: "End of the current month" },
  { value: "@yearStart", label: "Beginning of the current year" },
  { value: "@yearEnd", label: "End of the current year" },
]

const join = [
  { value: "&&", label: "and" },
  { value: "||", label: "or" },
]