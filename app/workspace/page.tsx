"use client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ComponentLibrary from "../../components/ComponentLibrary";
import Workspace from "../../components/Workspace";

export default function WorkspacePage() {
  return (
    <div className="flex h-full bg-gray-100 pt-16">
      <DndProvider backend={HTML5Backend}>
        <ComponentLibrary />
        <Workspace className="flex-1 bg-white p-8" />
      </DndProvider>
    </div>
  );
}
