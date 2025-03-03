"use client";
import { useState, useRef } from "react";
import Box, { BoxData, ComponentInfo } from "./Box";
import { FaUndo, FaRedo } from "react-icons/fa";

export default function Workspace({
  className,
  boxes,
  setBoxes,
  onSelectBox,
  onSelectComponent,
}: {
  className?: string;
  boxes: BoxData[];
  setBoxes: (boxes: BoxData[]) => void;
  onSelectBox?: (boxId: number | null) => void;
  onSelectComponent?: (boxId: number, componentIndex: number | null) => void;
}) {
  const [nextId, setNextId] = useState(1);
  const [history, setHistory] = useState<BoxData[][]>([[]]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const buttonBarRef = useRef<HTMLDivElement>(null);

  const saveHistory = (newBoxes: BoxData[]) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newBoxes);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      const previousBoxes = history[currentIndex - 1];
      setBoxes(previousBoxes);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRedo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < history.length - 1) {
      const nextBoxes = history[currentIndex + 1];
      setBoxes(nextBoxes);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const getButtonOffset = () => {
    if (buttonBarRef.current) {
      const buttonRect = buttonBarRef.current.getBoundingClientRect();
      return buttonRect.height + 8; // 按钮高度 + top-2 的 8px
    }
    return 32; // 默认值
  };

  const handleWorkspaceClick = (e: React.MouseEvent) => {
    if (!workspaceRef.current) return;

    const rect = workspaceRef.current.getBoundingClientRect();
    const buttonOffset = getButtonOffset();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top - buttonOffset;

    const boxWidth = 300;
    const workspaceWidth = rect.width;

    if (x + boxWidth > workspaceWidth) return;

    const isClickInUnconfirmedBox = boxes.some(
      (box) =>
        !box.isConfirmed &&
        x >= box.position.x &&
        x <= box.position.x + box.size.width &&
        y >= box.position.y &&
        y <= box.position.y + box.size.height
    );
    if (isClickInUnconfirmedBox) return;

    const clickedConfirmedBox = boxes.find(
      (box) =>
        box.isConfirmed &&
        x >= box.position.x &&
        x <= box.position.x + box.size.width &&
        y >= box.position.y &&
        y <= box.position.y + box.size.height
    );
    if (clickedConfirmedBox) {
      onSelectBox?.(clickedConfirmedBox.id);
      return;
    }

    onSelectBox?.(null);
    onSelectComponent?.(0, null);

    y = Math.max(y, 0);

    const newBox: BoxData = {
      id: nextId,
      position: { x, y },
      size: { width: 300, height: 350 },
      confirmedComponents: [],
      pendingComponents: [],
      isConfirmed: false,
    };

    const newBoxes = [...boxes, newBox];
    setBoxes(newBoxes);
    setNextId(nextId + 1);
    saveHistory(newBoxes);
  };

  return (
    <div
      ref={workspaceRef}
      className={`relative ${className || ""}`}
      onClick={handleWorkspaceClick}
      style={{ minHeight: "500px", overflowY: "auto" }}
    >
      <div
        ref={buttonBarRef}
        className="absolute top-2 left-1/2 transform -translate-x-1/2 flex space-x-2"
      >
        <button
          onClick={handleUndo}
          disabled={currentIndex <= 0}
          className={`p-2 rounded ${
            currentIndex <= 0 ? "text-gray-300 cursor-not-allowed" : "text-blue-500 hover:bg-blue-100"
          }`}
        >
          <FaUndo />
        </button>
        <button
          onClick={handleRedo}
          disabled={currentIndex >= history.length - 1}
          className={`p-2 rounded ${
            currentIndex >= history.length - 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-blue-500 hover:bg-blue-100"
          }`}
        >
          <FaRedo />
        </button>
      </div>

      {boxes.map((box) => (
        <div
          key={box.id}
          style={{
            position: "absolute",
            left: box.position.x,
            top: box.position.y + getButtonOffset(),
          }}
        >
          <Box
            box={box}
            onConfirm={(id) => {
              const boxToConfirm = boxes.find((b) => b.id === id);
              if (!boxToConfirm) return;
              const allComponents = [...boxToConfirm.confirmedComponents, ...boxToConfirm.pendingComponents];
              const totalComponentHeight = allComponents.reduce(
                (sum, comp) => sum + calculateComponentHeight(comp),
                0
              );
              const marginsHeight = allComponents.length > 1 ? (allComponents.length - 1) * 8 : 0;
              const padding = 32;
              const newHeight = totalComponentHeight + marginsHeight + padding;
              const newBoxes = boxes.map((b) =>
                b.id === id
                  ? {
                      ...b,
                      confirmedComponents: allComponents,
                      pendingComponents: [],
                      isConfirmed: true,
                      size: { ...b.size, height: newHeight },
                    }
                  : b
              );
              setBoxes(newBoxes);
              saveHistory(newBoxes);
            }}
            onCancel={(id) => {
              const newBoxes = boxes.filter((b) => b.id !== id);
              setBoxes(newBoxes);
              onSelectBox?.(null);
              saveHistory(newBoxes);
            }}
            onClick={(id) => {
              onSelectBox?.(id);
              setBoxes(boxes.map((b) => (b.id === id ? { ...b, isConfirmed: false } : b)));
            }}
            onAddComponent={(boxId, component) => {
              const newBoxes = boxes.map((b) =>
                b.id === boxId ? { ...b, pendingComponents: [...b.pendingComponents, component] } : b
              );
              setBoxes(newBoxes);
            }}
            onSelectComponent={onSelectComponent}
          />
        </div>
      ))}
    </div>
  );
}

const calculateComponentHeight = (comp: ComponentInfo) => {
  if (comp.type === "table") {
    const rows = comp.props?.rows || 2;
    return rows * 20; // 动态调整表格高度
  }
  return comp.height;
};