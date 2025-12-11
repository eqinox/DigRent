import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { logout } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { House, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const Navigation = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
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
          <MenubarTrigger
            onClick={() =>
              dispatch(
                logout({
                  onSuccess: () => {
                    router.push("/auth");
                  },
                  onError: () => {
                    console.log("error");
                  },
                })
              )
            }
          >
            <div className="flex flex-col items-center">
              <span>
                <LogOut />
              </span>
              <span>Изход</span>
            </div>
          </MenubarTrigger>
        </MenubarMenu>
      </Menubar>
    </nav>
  );
};

export default Navigation;
