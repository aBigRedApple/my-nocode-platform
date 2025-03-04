"use client";
import { useRef, useEffect, useMemo } from "react";
import { useDrop } from "react-dnd";
import { ComponentPreviewWithProps } from "./ComponentLibrary";

export interface ComponentInfo {
  type: string;
  width: number;
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

export const COMPONENT_DEFAULT_HEIGHTS: Record<string, number> = {
  button: 40,
  text: 40,
  radio: 40,
  checkbox: 40,
  image: 40,
  date: 40,
  dateRange: 40,
  table: 60,
  default: 60,
};

export const COMPONENT_MARGIN = 16;

export default function Box({
  box,
  onConfirm,
  onCancel,
  onClick,
  onAddComponent,
  onSelectComponent,
  onUpdateBox,
}: {
  box: BoxData;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
  onClick: (id: number) => void;
  onAddComponent: (boxId: number, component: ComponentInfo) => void;
  onSelectComponent?: (boxId: number, componentIndex: number) => void;
  onUpdateBox: (boxId: number, updatedBox: Partial<BoxData>) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  const allComponents = useMemo(() => {
    return [...box.confirmedComponents, ...box.pendingComponents];
  }, [box.confirmedComponents, box.pendingComponents]);

  useEffect(() => {
    // 计算所有组件的总高度和最大宽度
    const componentsHeight = allComponents.reduce((sum, comp) => sum + comp.height, 0);
    const marginsHeight = allComponents.length > 1 ? (allComponents.length - 1) * COMPONENT_MARGIN : 0;
    const padding = 32;
    const newHeight = Math.max(componentsHeight + marginsHeight + padding, 350); // 最小高度 350px

    const maxComponentWidth = allComponents.reduce((max, comp) => Math.max(max, comp.width), 135); // 最小宽度 135
    const newWidth = Math.max(maxComponentWidth + 32, box.size.width); // 加 padding

    // 如果高度或宽度需要更新，则调用 onUpdateBox
    if (newHeight !== box.size.height || newWidth !== box.size.width) {
      onUpdateBox(box.id, { size: { width: newWidth, height: newHeight } });
    }
  }, [allComponents, box.id, box.size.width, box.size.height, onUpdateBox]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "component",
    drop: (item: { type: string }) => {
      const baseHeight = COMPONENT_DEFAULT_HEIGHTS[item.type] || COMPONENT_DEFAULT_HEIGHTS.default;
      const componentHeight = baseHeight;
      const extraSpaceNeeded = componentHeight + (allComponents.length > 0 ? COMPONENT_MARGIN : 0);

      const currentHeight = allComponents.reduce((sum, comp) => sum + comp.height, 0) +
        (allComponents.length > 1 ? (allComponents.length - 1) * COMPONENT_MARGIN : 0) + 32;

      if (currentHeight + extraSpaceNeeded <= box.size.height) {
        onAddComponent(box.id, { type: item.type, width: 100, height: componentHeight, props: {} });
      } else {
        console.log("空间不足，无法添加组件");
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [allComponents, box.size.height, onAddComponent]);

  const renderComponents = (components: ComponentInfo[]) => {
    let currentTop = 16;
    return components.map((comp: ComponentInfo, index: number) => {
      const componentElement = (
        <div
          key={index}
          style={{
            position: "absolute",
            top: currentTop,
            width: comp.width,
            height: comp.height,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent?.(box.id, index);
          }}
        >
          <ComponentPreviewWithProps type={comp.type} props={comp.props} width={comp.width} height={comp.height} />
        </div>
      );
      currentTop += comp.height + (index < components.length - 1 ? COMPONENT_MARGIN : 0);
      return componentElement;
    });
  };

  return (
    <div
      ref={(node) => {
        drop(node);
        boxRef.current = node;
      }}
      className={`absolute ${box.isConfirmed ? "" : "border-2 border-blue-500"} p-4 ${isOver ? "bg-blue-50" : "bg-white"}`}
      style={{
        width: box.size.width,
        height: box.size.height, // 使用动态调整的高度
        position: "relative",
        cursor: box.isConfirmed ? "pointer" : "default",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(box.id);
      }}
    >
      {allComponents.length > 0 ? (
        renderComponents(allComponents)
      ) : !box.isConfirmed ? (
        <div className="flex items-center justify-center h-full text-gray-400">拖放组件到这里</div>
      ) : null}

      {!box.isConfirmed && (
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
      )}
    </div>
  );
}