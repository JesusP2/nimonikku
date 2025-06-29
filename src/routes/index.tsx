import { queryDb } from "@livestore/livestore";
import { useStore } from "@livestore/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { events, tables } from "@/server/livestore/schema";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { store } = useStore();
  const boards = store.useQuery(queryDb(tables.board.select("id", "name")));

  const createBoard = () => {
    const now = new Date();
    store.commit(
      events.boardCreated({
        id: crypto.randomUUID(),
        name: "New Board",
        description: "",
        updatedAt: now,
        createdAt: now,
        value: JSON.stringify({}),
      }),
    );
  };
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center font-bold text-2xl">
            Welcome to Board
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            onClick={createBoard}
            className={buttonVariants({ variant: "default" })}
          >
            Create a new board
          </Button>
          <Button>delete boards</Button>
          <li className="max-h-96 overflow-y-auto">
            {boards.map((board) => (
              <Link
                to="/board/$boardId"
                params={{ boardId: board.id }}
                key={board.id}
                className="flex items-center gap-4 p-4 hover:bg-background/10"
              >
                <div className="flex-grow">
                  <h2 className="font-bold text-xl">{board.name}</h2>
                  <p className="text-muted-foreground text-sm">
                    {board.description}
                  </p>
                </div>
                <Button>delete</Button>
              </Link>
            ))}
          </li>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 pt-4" />
      </Card>
    </div>
  );
}
