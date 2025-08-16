import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImportDeckDialog } from "./import-deck-dialog";
import { NewDeckDialog } from "./new-deck-dialog";

export function CreateDeckDropdown() {
  const [isCreateDeckDialogOpen, setIsCreateDeckDialogOpen] = useState(false);
  const [isImportDeckDialogOpen, setIsImportDeckDialogOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <PlusIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuItem onClick={() => setIsCreateDeckDialogOpen(true)}>
            Create Deck
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsImportDeckDialogOpen(true)}>
            Import Deck
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <NewDeckDialog
        trigger={null}
        open={isCreateDeckDialogOpen}
        setOpen={setIsCreateDeckDialogOpen}
      />
      <ImportDeckDialog
        trigger={null}
        open={isImportDeckDialogOpen}
        setOpen={setIsImportDeckDialogOpen}
      />
    </>
  );
}
