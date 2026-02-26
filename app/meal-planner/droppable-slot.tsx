"use client";

import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableSlotProps {
  id: string;
  date: string;
  mealType: string;
  className?: string;
  children: ReactNode;
}

export function DroppableSlot({ id, date, mealType, className, children }: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { date, mealType },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20" : ""}`}
    >
      {children}
    </div>
  );
}
