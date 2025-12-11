import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RootState, logout, fetchCategories } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { House, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { useSelector } from "react-redux";

const Navigation = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );
  const [isSubCategoryDialogOpen, setIsSubCategoryDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  useEffect(() => {
    if (isSubCategoryDialogOpen && categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [isSubCategoryDialogOpen, categories.length, dispatch]);

  const handleLogout = () => {
    dispatch(
      logout({
        onSuccess: () => {
          router.push("/auth");
        },
        onError: () => {
          console.log("error");
        },
      })
    );
  };

  const handleAddSubCategory = () => {
    if (selectedCategoryId) {
      router.push(`/sub-category/add?categoryId=${selectedCategoryId}`);
      setIsSubCategoryDialogOpen(false);
      setSelectedCategoryId("");
    }
  };

  return (
    <nav className="absolute bottom-0 w-full">
      <Menubar className="justify-center h-16">
        <MenubarMenu>
          <MenubarTrigger onClick={() => router.push("/")}>
            <div className="flex flex-col items-center">
              <span>
                <House />
              </span>
              <span>Начало</span>
            </div>
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            {/* <div className="flex flex-col items-center">
              <span>
                <LogOut />
              </span>
              <span>Изход</span>
            </div> */}
          </MenubarTrigger>
          <MenubarContent>
            {user && user.role === "admin" && (
              <>
                <MenubarItem onClick={() => router.push("/category/add")}>
                  <Plus /> Добави категория
                </MenubarItem>
                <MenubarItem onClick={() => setIsSubCategoryDialogOpen(true)}>
                  <Plus /> Добави подкатегория
                </MenubarItem>
              </>
            )}

            <MenubarSeparator />
            <MenubarItem onClick={() => handleLogout()}>Изход</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <Dialog open={isSubCategoryDialogOpen} onOpenChange={setIsSubCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Избери категория</DialogTitle>
            <DialogDescription>
              Изберете категория, към която да добавите подкатегория
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-select">Категория</Label>
              <select
                id="category-select"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Изберете категория</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubCategoryDialogOpen(false);
                setSelectedCategoryId("");
              }}
            >
              Отказ
            </Button>
            <Button onClick={handleAddSubCategory} disabled={!selectedCategoryId}>
              Продължи
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navigation;
