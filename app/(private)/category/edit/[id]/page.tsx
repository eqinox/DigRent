"use client";

import { use } from "react";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold">Редактиране на категория</h1>
      <p>Category ID: {id}</p>
    </div>
  );
}

