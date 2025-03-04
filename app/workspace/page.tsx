"use client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ComponentLibrary from "../../components/ComponentLibrary";
import Workspace from "../../components/Workspace";
import PropertiesPanel from "../../components/PropertiesPanel";
import { useState } from "react";
import { BoxData, ComponentInfo } from "../../components/Box";

export default function WorkspacePage() {
  const [boxes, setBoxes] = useState<BoxData[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);

  const handleUpdateBox = (boxId: number, updatedBox: Partial<BoxData> | null) => {
    setBoxes((prev) => {
      if (updatedBox === null) {
        return prev.filter((box) => box.id !== boxId); // 删除盒子
      }
      return prev.map((box) => (box.id === boxId ? { ...box, ...updatedBox } : box));
    });
    if (updatedBox === null) setSelectedBoxId(null); // 删除后清空选中状态
  };

  const handleUpdateComponent = (
    boxId: number,
    componentIndex: number,
    updatedComponent: Partial<ComponentInfo>
  ) => {
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id !== boxId) return box;
        const allComponents = [...box.confirmedComponents, ...box.pendingComponents];
        allComponents[componentIndex] = { ...allComponents[componentIndex], ...updatedComponent };
        return {
          ...box,
          confirmedComponents: allComponents.slice(0, box.confirmedComponents.length),
          pendingComponents: allComponents.slice(box.confirmedComponents.length),
        };
      })
    );
  };

  return (
    <div className="flex h-full bg-gray-100 pt-16">
      <DndProvider backend={HTML5Backend}>
        <ComponentLibrary />
        <Workspace
          className="flex-1 bg-white p-8"
          boxes={boxes}
          setBoxes={setBoxes}
          onSelectBox={setSelectedBoxId}
          onSelectComponent={(boxId, index) => {
            setSelectedBoxId(boxId);
            setSelectedComponentIndex(index);
          }}
        />
        <PropertiesPanel
          selectedBox={boxes.find((box) => box.id === selectedBoxId) || null}
          selectedComponentIndex={selectedComponentIndex}
          onUpdateBox={handleUpdateBox}
          onUpdateComponent={handleUpdateComponent}
        />
      </DndProvider>
    </div>
  );
}