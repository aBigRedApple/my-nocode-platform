"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useDrop } from "react-dnd";
import { ComponentPreview } from "./ComponentLibrary";

export interface ComponentInfo {
  type: string;
  height: number;
}

export interface BoxData {
  id: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  confirmedComponents: ComponentInfo[];
  pendingComponents: ComponentInfo[];
  isConfirmed: boolean;
}

const COMPONENT_DEFAULT_HEIGHTS: Record<string, number> = {
  button: 40,
  input: 50,
  select: 50,
  checkbox: 30,
  default: 60,
};

const COMPONENT_MARGIN = 8;

export default function Box({
  box,
  onConfirm,
  onCancel,
  onClick,
  onAddComponent,
}: {
  box: BoxData;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
  onClick: (id: number) => void;
  onAddComponent: (boxId: number, component: ComponentInfo) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [totalComponentHeight, setTotalComponentHeight] = useState(0);

  const allComponents = useMemo(() => {
    return [...box.confirmedComponents, ...box.pendingComponents];
  }, [box.confirmedComponents, box.pendingComponents]);

  useEffect(() => {
    const componentsCount = allComponents.length;
    const componentsHeight = allComponents.reduce((sum, comp) => sum + comp.height, 0);
    const marginsHeight = componentsCount > 1 ? (componentsCount - 1) * COMPONENT_MARGIN : 0;
    setTotalComponentHeight(componentsHeight + marginsHeight);
  }, [allComponents]);

  const padding = 32;
  const availableHeight = box.size.height - totalComponentHeight - padding;

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "component",
      drop: (item: { type: string }) => {
        const componentHeight = COMPONENT_DEFAULT_HEIGHTS[item.type] || COMPONENT_DEFAULT_HEIGHTS.default;
        const extraSpaceNeeded = componentHeight + (allComponents.length > 0 ? COMPONENT_MARGIN : 0);

        if (availableHeight >= extraSpaceNeeded) {
          onAddComponent(box.id, { type: item.type, height: componentHeight });
        } else {
          console.log("空间不足");
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [availableHeight, allComponents, box.id, onAddComponent]
  );

  if (box.isConfirmed) {
    return (
      <div
        className="absolute border-transparent"
        style={{
          left: box.position.x,
          top: box.position.y,
          width: box.size.width,
          height: box.size.height,
          padding: "16px",
          cursor: "pointer",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(box.id); // 进入编辑模式
        }}
      >
        {box.confirmedComponents.map((comp: ComponentInfo, index: number) => (
          <div
            key={index}
            style={{
              height: comp.height,
              marginBottom: index < box.confirmedComponents.length - 1 ? COMPONENT_MARGIN : 0,
            }}
          >
            <ComponentPreview type={comp.type} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={(node) => {
        drop(node);
        boxRef.current = node;
      }}
      className={`absolute border-2 border-blue-500 rounded-lg shadow-md p-4 ${isOver ? "bg-blue-50" : "bg-white"}`}
      style={{
        left: box.position.x,
        top: box.position.y,
        width: box.size.width,
        height: box.size.height,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {allComponents.length > 0 ? (
        allComponents.map((comp: ComponentInfo, index: number) => (
          <div
            key={index}
            style={{
              height: comp.height,
              marginBottom: index < allComponents.length - 1 ? COMPONENT_MARGIN : 0,
            }}
          >
            <ComponentPreview type={comp.type} />
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">拖放组件到这里</div>
      )}

      <div className="absolute bottom-2 right-2 flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConfirm(box.id);
          }}
          className="px-2 py-1 bg-green-500 text-white rounded text-sm"
        >
          确定
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancel(box.id);
          }}
          className="px-2 py-1 bg-red-500 text-white rounded text-sm"
        >
          取消
        </button>
      </div>
    </div>
  );
}