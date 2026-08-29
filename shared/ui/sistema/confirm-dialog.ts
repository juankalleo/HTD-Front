"use client";

import Swal, { type SweetAlertIcon, type SweetAlertResult } from "sweetalert2";

type ConfirmVariant = "default" | "destructive";

export type ConfirmDialogOptions = {
  title?: string;
  text?: string;
  icon?: SweetAlertIcon;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmVariant?: ConfirmVariant;
  allowOutsideClick?: boolean;
  allowEscapeKey?: boolean;
};

const buttonBaseClass =
  "inline-flex h-10 min-w-28 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25";

const buttonClass: Record<ConfirmVariant, string> = {
  default: `${buttonBaseClass} bg-primary text-primary-content hover:brightness-95`,
  destructive: `${buttonBaseClass} bg-error text-error-content hover:brightness-95`,
};

const cancelButtonClass = `${buttonBaseClass} border border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200 hover:text-base-content`;

export function showConfirmDialog({
  title = "Confirmar ação",
  text = "Revise os dados antes de continuar.",
  icon = "question",
  showCancelButton = true,
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar",
  confirmVariant = "default",
  allowOutsideClick = true,
  allowEscapeKey = true,
}: ConfirmDialogOptions = {}): Promise<SweetAlertResult> {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: showCancelButton,
    buttonsStyling: false,
    allowOutsideClick,
    allowEscapeKey,
    background: "var(--color-base-100)",
    color: "var(--color-base-content)",
    customClass: {
      popup: "rounded-lg border border-base-300 bg-base-100 px-6 py-5 text-base-content shadow-xl",
      title: "text-lg font-bold text-base-content",
      htmlContainer: "text-sm leading-6 text-base-content/65",
      actions: "mt-6 flex-row-reverse gap-2",
      confirmButton: buttonClass[confirmVariant],
      cancelButton: cancelButtonClass,
    },
  });
}

export async function confirmDialog(options?: ConfirmDialogOptions): Promise<boolean> {
  const result = await showConfirmDialog(options);
  return result.isConfirmed;
}
