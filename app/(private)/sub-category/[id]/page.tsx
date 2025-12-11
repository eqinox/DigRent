import SubCategoriesList from "@/components/lists/SubCategoriesList";
import { use } from "react";

export default function SubCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SubCategoriesList categoryId={id} />;
}
