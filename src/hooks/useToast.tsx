import toast from "react-hot-toast";

export function useToast() {
  return {
    success: (message: string) =>
      toast.success(message, {
        duration: 3000,
        style: { fontWeight: "500" },
      }),

    error: (message: string) =>
      toast.error(message, {
        duration: 4000,
        style: { fontWeight: "500" },
      }),

    loading: (message: string) => toast.loading(message),

    dismiss: (id?: string) => (id ? toast.dismiss(id) : toast.dismiss()),

    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      },
    ) =>
      toast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: (err) => (err as any)?.response?.data?.message ?? messages.error,
      }),
  };
}
