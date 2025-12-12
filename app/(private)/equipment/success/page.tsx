"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function EquipmentSuccessPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const name = searchParams.get("name");

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 p-4 pb-20 text-center">
      <h1 className="text-2xl font-bold">
        {mode === "edit"
          ? "Оборудването е обновено успешно"
          : "Оборудването е създадено успешно"}
      </h1>
      {name && (
        <p className="text-muted-foreground">
          {mode === "edit"
            ? `Обновихте оборудването "${name}".`
            : `Добавихте ново оборудване "${name}".`}
        </p>
      )}

      <div className="flex gap-2">
        <Button asChild>
          <Link href="/categories">Към категориите</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/categories">Назад</Link>
        </Button>
      </div>
    </div>
  );
}
