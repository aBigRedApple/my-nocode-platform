"use client";
import { useState, useRef } from "react";
import Box, { BoxData, ComponentInfo } from "./Box";
import { FaUndo, FaRedo } from "react-icons/fa"; // 引入图标

export default function Workspace({ className }: { className?: string }) {
  const [boxes, setBoxes] = useState<BoxData[]>([]);
  const [nextId, setNextId] = useState(1);
  const [history, setHistory] = useState<BoxData[][]>([[]]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // 保存历史状态
  const saveHistory = (newBoxes: BoxData[]) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newBoxes);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  // 后退（撤回）
  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (currentIndex > 0) {
      const previousBoxes = history[currentIndex - 1];
      setBoxes(previousBoxes);
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 前进
  const handleRedo = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (currentIndex < history.length - 1) {
      const nextBoxes = history[currentIndex + 1];
      setBoxes(nextBoxes);
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 点击工作区创建新盒子
  const handleWorkspaceClick = (e: React.MouseEvent) => {
    if (!workspaceRef.current) return;

    const rect = workspaceRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
    if (clickedConfirmedBox) return;

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

  // 确认盒子
  const handleConfirmBox = (id: number) => {
    const boxToConfirm = boxes.find((box) => box.id === id);
    if (!boxToConfirm) return;

    const allComponents = [...boxToConfirm.confirmedComponents, ...boxToConfirm.pendingComponents];
    const totalComponentHeight = allComponents.reduce((sum, comp) => sum + comp.height, 0);
    const marginsHeight = allComponents.length > 1 ? (allComponents.length - 1) * 8 : 0;
    const padding = 32;

    const newHeight = totalComponentHeight + marginsHeight + padding;

    const newBoxes = boxes.map((box) =>
      box.id === id
        ? {
            ...box,
            confirmedComponents: allComponents,
            pendingComponents: [],
            isConfirmed: true,
            size: { ...box.size, height: newHeight },
          }
        : box
    );
    setBoxes(newBoxes);
    saveHistory(newBoxes);
  };

  // 取消盒子
  const handleCancelBox = (id: number) => {
    const newBoxes = boxes.filter((box) => box.id !== id);
    setBoxes(newBoxes);
    saveHistory(newBoxes);
  };

  // 添加组件到待确认列表
  const handleAddComponent = (boxId: number, component: ComponentInfo) => {
    const newBoxes = boxes.map((box) =>
      box.id === boxId ? { ...box, pendingComponents: [...box.pendingComponents, component] } : box
    );
    setBoxes(newBoxes);
    // 暂不保存历史，确认时再保存
  };

  return (
    <div
      ref={workspaceRef}
      className={`relative ${className || ""}`}
      onClick={handleWorkspaceClick}
      style={{ minHeight: "500px" }}
    >
      {/* 前进和后退按钮 */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
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
        <Box
          key={box.id}
          box={box}
          onConfirm={handleConfirmBox}
          onCancel={handleCancelBox}
          onClick={(id) =>
            setBoxes(boxes.map((b) => (b.id === id ? { ...b, isConfirmed: false } : b)))
          }
          onAddComponent={handleAddComponent}
        />
      ))}
    </div>
  );
}