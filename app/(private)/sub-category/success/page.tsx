"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function SubCategorySuccessPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const type = searchParams.get("type");
  const categoryId = searchParams.get("categoryId");

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 p-4 pb-20 text-center">
      <h1 className="text-2xl font-bold">
        {mode === "edit"
          ? "Подкатегорията е обновена успешно"
          : "Подкатегорията е създадена успешно"}
      </h1>
      {type && (
        <p className="text-muted-foreground">
          {mode === "edit"
            ? `Обновихте подкатегорията "${type}".`
            : `Добавихте нова подкатегория "${type}".`}
        </p>
      )}

      {categoryId && (
        <Button asChild>
          <Link href={`/sub-category/${categoryId}`}>Към под категорията</Link>
        </Button>
      )}
    </div>
  );
}





