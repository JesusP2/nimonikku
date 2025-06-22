import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/livestore/footer";
import { Header } from "@/components/livestore/header";
import { MainSection } from "@/components/livestore/main";

export const Route = createFileRoute("/todos")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header />
      <MainSection />
      <Footer />
    </>
  );
}
