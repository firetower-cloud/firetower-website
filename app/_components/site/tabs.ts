import type { KeyboardEvent } from "react";
export function tabKey(
  e: KeyboardEvent<HTMLButtonElement>,
  index: number,
  count: number,
  select: (index: number) => void,
) {
  if (
    ![
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ].includes(e.key)
  )
    return;
  e.preventDefault();
  const next =
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? count - 1
        : (index +
            (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : count - 1)) %
          count;
  select(next);
  const tabs =
    e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
      "[role=tab]",
    );
  tabs?.[next]?.focus();
}
