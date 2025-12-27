"use client"

import { useTheme } from "@components/providers/ThemeProvider"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { isDarkMode } = useTheme()

  return (
    <Sonner
      theme={isDarkMode ? "dark" : "light"}
      position="top-right"
      richColors
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gray-800 group-[.toaster]:text-white group-[.toaster]:border-gray-700 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-300",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-700 group-[.toast]:text-gray-300",
          success: "group-[.toaster]:!bg-green-900 group-[.toaster]:!text-green-100 group-[.toaster]:!border-green-700",
          error: "group-[.toaster]:!bg-red-900 group-[.toaster]:!text-red-100 group-[.toaster]:!border-red-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
