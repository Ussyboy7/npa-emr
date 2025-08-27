import * as React from "react"

export type ToastActionElement = React.ReactNode

export type ToastProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}