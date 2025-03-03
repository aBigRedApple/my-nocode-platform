"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useDrop } from "react-dnd";
import { ComponentPreviewWithProps } from "./ComponentLibrary";

export interface ComponentInfo {
  type: string;
  height: number;
  props?: Record<string, any>;
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
  text: 40,
  radio: 40,
  checkbox: 40,
  image: 40,
  date: 40,
  dateRange: 40,
  table: 40,
  default: 60,
};

const COMPONENT_MARGIN = 8;

export default function Box({
  box,
  onConfirm,
  onCancel,
  onClick,
  onAddComponent,
  onSelectComponent,
}: {
  box: BoxData;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
  onClick: (id: number) => void;
  onAddComponent: (boxId: number, component: ComponentInfo) => void;
  onSelectComponent?: (boxId: number, componentIndex: number) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [totalComponentHeight, setTotalComponentHeight] = useState(0);

  const allComponents = useMemo(() => {
    return [...box.confirmedComponents, ...box.pendingComponents];
  }, [box.confirmedComponents, box.pendingComponents]);

  const calculateComponentHeight = (comp: ComponentInfo) => {
    if (comp.type === "table") {
      const rows = comp.props?.rows || 2;
      return rows * 20;
    }
    return COMPONENT_DEFAULT_HEIGHTS[comp.type] || COMPONENT_DEFAULT_HEIGHTS.default;
  };

  useEffect(() => {
    const componentsHeight = allComponents.reduce((sum, comp) => sum + calculateComponentHeight(comp), 0);
    const marginsHeight = allComponents.length > 1 ? (allComponents.length - 1) * COMPONENT_MARGIN : 0;
    const padding = 32;
    const newTotalHeight = componentsHeight + marginsHeight + padding;
    setTotalComponentHeight(Math.max(newTotalHeight, 500)); // 确保初始高度不低于 500px
  }, [allComponents]);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "component",
      drop: (item: { type: string }) => {
        const baseHeight = COMPONENT_DEFAULT_HEIGHTS[item.type] || COMPONENT_DEFAULT_HEIGHTS.default;
        const componentHeight = item.type === "table" ? 40 : baseHeight;
        const extraSpaceNeeded = componentHeight + (allComponents.length > 0 ? COMPONENT_MARGIN : 0);

        if (totalComponentHeight + extraSpaceNeeded <= box.size.height || !box.isConfirmed) {
          onAddComponent(box.id, { type: item.type, height: componentHeight, props: {} });
        } else {
          console.log("空间不足");
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [totalComponentHeight, allComponents, box.id, box.size.height, box.isConfirmed, onAddComponent]
  );

  if (box.isConfirmed) {
    return (
      <div
        className="absolute border-transparent"
        style={{
          width: box.size.width,
          height: totalComponentHeight,
          padding: "16px",
          cursor: "pointer",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(box.id);
        }}
      >
        {box.confirmedComponents.map((comp: ComponentInfo, index: number) => (
          <div
            key={index}
            style={{
              height: calculateComponentHeight(comp),
              marginBottom: index < box.confirmedComponents.length - 1 ? COMPONENT_MARGIN : 0,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectComponent?.(box.id, index);
            }}
          >
            <ComponentPreviewWithProps type={comp.type} props={comp.props} />
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
        width: box.size.width,
        height: totalComponentHeight,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {allComponents.length > 0 ? (
        allComponents.map((comp: ComponentInfo, index: number) => (
          <div
            key={index}
            style={{
              height: calculateComponentHeight(comp),
              marginBottom: index < allComponents.length - 1 ? COMPONENT_MARGIN : 0,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectComponent?.(box.id, index);
            }}
          >
            <ComponentPreviewWithProps type={comp.type} props={comp.props} />
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