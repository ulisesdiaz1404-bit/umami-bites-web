import * as React from "react";

/**
 * Implementación mínima de Slot (patrón Radix) sin dependencias externas.
 * Permite `asChild`: fusiona props y className sobre el hijo único.
 */
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>((props, ref) => {
  const { children, ...slotProps } = props;

  if (!React.isValidElement(children)) {
    return null;
  }

  const child = children as React.ReactElement<Record<string, unknown>>;
  const childProps = child.props;

  return React.cloneElement(child, {
    ...slotProps,
    ...childProps,
    className: [
      (slotProps as { className?: string }).className,
      (childProps as { className?: string }).className,
    ]
      .filter(Boolean)
      .join(" "),
    ref,
  } as Record<string, unknown>);
});
Slot.displayName = "Slot";
