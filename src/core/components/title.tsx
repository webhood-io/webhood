import React from "react"

interface TitleProps {
  title?: string | React.ReactNode
  subtitle?: string | React.ReactNode
}
export function Title(props: TitleProps) {
  return (
    <div className="flex max-w-[980px] flex-col items-start gap-2">
      {props.title && (
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          {props.title}
        </h1>
      )}
      {props.subtitle && (
        <p className="max-w-[700px] text-lg text-slate-700 dark:text-slate-400 sm:text-xl">
          {props.subtitle}
        </p>
      )}
    </div>
  )
}
