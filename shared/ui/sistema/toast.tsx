"use client";

import Swal, { type SweetAlertIcon } from "sweetalert2";

type ToastType = Extract<SweetAlertIcon, "success" | "error" | "warning" | "info">;

interface ToastOptions {
  title: string;
  description?: string;
  timer?: number;
}

type ToastInput = string | ToastOptions;

function normalize(input: ToastInput): ToastOptions {
  return typeof input === "string" ? { title: input } : input;
}

const ACCENT_BORDER: Record<ToastType, string> = {
  success: "border-l-success",
  error: "border-l-error",
  warning: "border-l-warning",
  info: "border-l-info",
};

const ACCENT_BAR: Record<ToastType, string> = {
  success: "bg-success",
  error: "bg-error",
  warning: "bg-warning",
  info: "bg-info",
};

/** Toast padrão do projeto (sweetalert2), pra feedback de sucesso/erro em submits. */
export const Toast = {
  fire: (options: ToastOptions & { icon: ToastType }) => {
    const { title, description, icon, timer = 3200 } = options;

    return Swal.mixin({
      toast: true,
      position: "bottom-end",
      icon,
      title,
      text: description,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      customClass: {
        popup: `rounded-lg border border-l-4 ${ACCENT_BORDER[icon]} border-base-300 bg-base-100 shadow-md`,
        title: "text-base-content text-sm font-semibold",
        htmlContainer: "text-base-content/60 text-xs",
        timerProgressBar: ACCENT_BAR[icon],
      },
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    }).fire();
  },

  success: (input: ToastInput) => Toast.fire({ ...normalize(input), icon: "success" }),
  error: (input: ToastInput) => Toast.fire({ ...normalize(input), icon: "error" }),
  warning: (input: ToastInput) => Toast.fire({ ...normalize(input), icon: "warning" }),
  info: (input: ToastInput) => Toast.fire({ ...normalize(input), icon: "info" }),
};
