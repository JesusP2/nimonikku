import { queryDb } from "@livestore/livestore";
import { useStore } from "@livestore/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Database, Edit, Plus, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { useIsOnline } from "@/components/providers/is-online";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { events, tables } from "@/server/livestore/schema";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { store } = useStore();
  const { isOnline } = useIsOnline();
  const boards = store.useQuery(
    queryDb(
      tables.board.select(
        "id",
        "name",
        "description",
        "createdAt",
        "updatedAt",
      ),
    ),
  );

  const [editingBoard, setEditingBoard] = useState<any | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const createBoard = () => {
    const now = new Date();
    store.commit(
      events.boardCreated({
        id: crypto.randomUUID(),
        name: newBoardName || "New Board",
        description: newBoardDescription || "",
        updatedAt: now,
        createdAt: now,
        value: JSON.stringify({}),
      }),
    );
    setNewBoardName("");
    setNewBoardDescription("");
    setIsCreateDialogOpen(false);
  };

  const deleteBoard = (id: string) => {
    store.commit(events.boardDeleted({ id }));
  };

  const startEditing = (board: any) => {
    setEditingBoard(board);
    setEditingName(board.name);
    setEditingDescription(board.description);
    setIsEditDialogOpen(true);
  };

  const saveEdit = () => {
    if (editingBoard) {
      store.commit(
        events.boardPropertiesUpdated({
          id: editingBoard.id,
          name: editingName,
          description: editingDescription,
          updatedAt: new Date(),
        }),
      );
      setEditingBoard(null);
      setIsEditDialogOpen(false);
    }
  };

  const cancelEdit = () => {
    setEditingBoard(null);
    setEditingName("");
    setEditingDescription("");
    setIsEditDialogOpen(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background p-6 font-mono text-foreground">
      {/* Header */}
      <div className="mb-6 rounded-lg border border-border bg-card p-6 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-foreground">
                BOARD CONTROL PANEL
              </h1>
              <p className="text-muted-foreground">
                System Management Interface v2.1
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary">
              <Activity className="h-4 w-4" />
              <span className="text-sm">{isOnline ? "ONLINE" : "OFFLINE"}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded border border-border bg-primary/10 p-4">
            <div className="font-bold text-2xl text-primary">
              {boards.length}
            </div>
            <div className="text-muted-foreground text-sm">TOTAL BOARDS</div>
          </div>
          <div className="rounded border border-border bg-accent/10 p-4">
            <div className="font-bold text-2xl text-accent-foreground">
              {
                boards.filter(
                  (b) =>
                    b.updatedAt &&
                    new Date(b.updatedAt).getTime() > Date.now() - 86400000,
                ).length
              }
            </div>
            <div className="text-muted-foreground text-sm">RECENT ACTIVITY</div>
          </div>
          <div className="rounded border border-border bg-secondary/10 p-4">
            <div className="font-bold text-2xl text-secondary-foreground">
              ACTIVE
            </div>
            <div className="text-muted-foreground text-sm">SYSTEM STATUS</div>
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="overflow-hidden rounded-lg border border-border bg-card backdrop-blur">
        <div className="flex items-center justify-between border-border border-b p-4">
          <h2 className="font-bold text-foreground text-lg">BOARD REGISTRY</h2>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                className="border border-primary bg-primary/20 font-mono text-primary-foreground hover:bg-primary/30"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                CREATE NEW BOARD
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border bg-background font-mono text-foreground">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  CREATE NEW BOARD
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Initialize a new board in the system registry.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-foreground text-sm">
                    BOARD NAME
                  </label>
                  <Input
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    className="border-border bg-input font-mono text-foreground"
                    placeholder="Enter board name..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-foreground text-sm">
                    DESCRIPTION
                  </label>
                  <Input
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    className="border-border bg-input font-mono text-foreground"
                    placeholder="Enter description..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setIsCreateDialogOpen(false)}
                  variant="outline"
                  className="border-destructive font-mono text-destructive hover:bg-destructive/20"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={createBoard}
                  className="border border-primary bg-primary/20 font-mono text-primary-foreground hover:bg-primary/30"
                >
                  CREATE BOARD
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              cancelEdit();
            }
          }}
        >
          <DialogContent className="border-border bg-background font-mono text-foreground">
            <DialogHeader>
              <DialogTitle className="text-foreground">EDIT BOARD</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Modify board properties in the system registry.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-foreground text-sm">
                  BOARD NAME
                </label>
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="border-border bg-input font-mono text-foreground"
                  placeholder="Enter board name..."
                />
              </div>
              <div>
                <label className="mb-2 block text-foreground text-sm">
                  DESCRIPTION
                </label>
                <Input
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  className="border-border bg-input font-mono text-foreground"
                  placeholder="Enter description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={cancelEdit}
                variant="outline"
                className="border-destructive font-mono text-destructive hover:bg-destructive/20"
              >
                CANCEL
              </Button>
              <Button
                onClick={saveEdit}
                className="border border-primary bg-primary/20 font-mono text-primary-foreground hover:bg-primary/30"
              >
                SAVE CHANGES
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="font-bold font-mono text-foreground">
                  ID
                </TableHead>
                <TableHead className="font-bold font-mono text-foreground">
                  NAME
                </TableHead>
                <TableHead className="font-bold font-mono text-foreground">
                  DESCRIPTION
                </TableHead>
                <TableHead className="font-bold font-mono text-foreground">
                  LINK
                </TableHead>
                <TableHead className="font-bold font-mono text-foreground">
                  CREATED
                </TableHead>
                <TableHead className="font-bold font-mono text-foreground">
                  UPDATED
                </TableHead>
                <TableHead className="font-bold font-mono text-foreground">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boards.map((board) => (
                <TableRow
                  key={board.id}
                  className="border-border hover:bg-muted/50"
                >
                  <TableCell className="font-mono text-muted-foreground text-sm">
                    {board.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono text-foreground">
                    {board.name}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground text-sm">
                    {board.description || "No description"}
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/board/$boardId"
                      params={{ boardId: board.id }}
                      className="font-mono text-primary text-sm underline hover:text-primary/80"
                    >
                      VIEW BOARD
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground text-sm">
                    {formatDate(board.createdAt)}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground text-sm">
                    {formatDate(board.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => startEditing(board)}
                        size="sm"
                        variant="outline"
                        className="h-8 border-accent px-2 text-accent-foreground hover:bg-accent/20"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => deleteBoard(board.id)}
                        size="sm"
                        variant="outline"
                        className="h-8 border-destructive px-2 text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {boards.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Database className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="font-mono">NO BOARDS FOUND IN REGISTRY</p>
            <p className="mt-2 font-mono text-sm">
              Initialize a new board to begin operations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
