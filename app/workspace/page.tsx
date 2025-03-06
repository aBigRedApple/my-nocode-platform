"use client";
import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ComponentLibrary from "../../components/ComponentLibrary";
import Workspace from "../../components/Workspace";
import PropertiesPanel from "../../components/PropertiesPanel";
import axios from "../../utils/axios";
import { BoxData, ComponentInfo } from "../../components/Box";

const WorkspacePage: React.FC = () => {
  const [boxes, setBoxes] = useState<BoxData[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);

  // 加载已有布局（示例：加载最新布局，可选）
  useEffect(() => {
    const loadLayout = async () => {
      try {
        const response = await axios.get<{ boxes: any[] }>("/api/project/load");
        const loadedBoxes: BoxData[] = response.data.boxes.map((box) => ({
          id: box.id,
          position: { x: box.positionX, y: box.positionY },
          size: { width: box.width, height: box.height },
          confirmedComponents: box.components.map((comp: any) => ({
            id: comp.id,
            type: comp.type,
            width: comp.width,
            height: comp.height,
            props: comp.props || {},
          })),
          pendingComponents: [],
          isConfirmed: true,
        }));
        setBoxes(loadedBoxes);
      } catch (error) {
        console.error("Load layout error:", error);
      }
    };
    // loadLayout(); // 可通过按钮触发，这里注释掉，因为是新建项目
  }, []);

  const handleUpdateBox = (boxId: number, updatedBox: Partial<BoxData> | null) => {
    if (updatedBox === null) {
      setBoxes((prev) => prev.filter((box) => box.id !== boxId));
      setSelectedBoxId(null);
      return;
    }
    setBoxes((prev) => prev.map((box) => (box.id === boxId ? { ...box, ...updatedBox } : box)));
  };

  const handleUpdateComponent = (
    boxId: number,
    componentIndex: number,
    updatedComponent: Partial<ComponentInfo> & { file?: File }
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
          isSave={true} // 显式传入 isSave=true，确保显示保存按钮
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
};

export default WorkspacePage;