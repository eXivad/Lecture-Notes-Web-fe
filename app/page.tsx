import { DropBoxComponent } from "@/components/lecture-notes-converter";

export default function Home() {
  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col gap-1 items-center">
        <h1 className="text-4xl font-bold text-primary">Lecture Notes Web</h1>
        <p>Converti le tue slide in pratici blocchi appunti</p>
      </div>

      <DropBoxComponent />
      
    </div>
  );
}
