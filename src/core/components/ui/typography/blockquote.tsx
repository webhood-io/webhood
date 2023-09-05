export function TypographyBlockquote({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <blockquote className="mt-6 border-l-2 border-slate-300 pl-6 italic text-slate-800 dark:border-slate-600 dark:text-slate-200">
      {children}
    </blockquote>
  )
}
