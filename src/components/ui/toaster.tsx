
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props}
            className="animate-fade-in data-[state=closed]:animate-fade-out bg-gradient-to-r from-white to-gray-50 dark:from-slate-950 dark:to-slate-900 border-purple-200 shadow-xl"
          >
            <div className="grid gap-1">
              {title && <ToastTitle className="text-lg font-bold text-noor-purple">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-sm opacity-90">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="fixed left-1/2 transform -translate-x-1/2 top-4 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  )
}
