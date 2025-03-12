"use client";
import { useRef, useMemo } from "react";
import { useDrop } from "react-dnd";
import { ComponentPreviewWithProps } from "./ComponentLibrary";

export interface ComponentInfo {
  id?: number;
  type: string;
  width: string | number;
  height: number;
  props?: Record<string, any>;
  file?: File;
}

export interface BoxData {
  id: number;
  position: { x: number; y: number };
  size: { width: string };
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

interface BoxProps {
  box: BoxData;
  index: number; // 新增索引
  totalBoxes: number; // 新增总数
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
  onClick: (id: number) => void;
  onAddComponent: (boxId: number, component: ComponentInfo) => void;
  onSelectComponent?: (boxId: number, componentIndex: number) => void;
  onUpdateBox: (boxId: number, updatedBox: Partial<BoxData> | null) => void;
}

const Box: React.FC<BoxProps> = ({
  box,
  index,
  totalBoxes,
  onConfirm,
  onCancel,
  onClick,
  onAddComponent,
  onSelectComponent,
  onUpdateBox,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);

  const allComponents = useMemo(
    () => [...box.confirmedComponents, ...box.pendingComponents],
    [box.confirmedComponents, box.pendingComponents]
  );

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "component",
    drop: (item: { type: string }) => {
      const baseHeight = COMPONENT_DEFAULT_HEIGHTS[item.type] || COMPONENT_DEFAULT_HEIGHTS.default;
      const newComponent: ComponentInfo = {
        type: item.type,
        width: "100%",
        height: baseHeight,
        props: {},
      };
      onAddComponent(box.id, newComponent);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const renderComponents = (components: ComponentInfo[]) => {
    return components.map((comp, index) => (
      <div
        key={`${comp.type}-${index}`}
        className="mb-4"
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.(box.id, index);
        }}
      >
        <ComponentPreviewWithProps type={comp.type} props={comp.props} width={comp.width} height={comp.height} />
      </div>
    ));
  };

  // 判断是否为最后一个盒子
  const isLastBox = index === totalBoxes - 1;

  return (
    <div
      ref={drop}
      className={`p-4 flex flex-col ${
        !box.isConfirmed
          ? "border-2 border-blue-500"
          : isLastBox
          ? "border-b-0" // 最后一个盒子无虚线
          : "border-b-2 border-dashed border-gray-300" // 非最后一个盒子加虚线
      } ${isOver ? "bg-blue-50" : "bg-white"}`}
      style={{
        width: box.size.width,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(box.id);
      }}
    >
      <div className="flex-1">
        {allComponents.length > 0 ? (
          <div className="flex flex-col">{renderComponents(allComponents)}</div>
        ) : !box.isConfirmed ? (
          <div className="flex items-center justify-center h-20 text-gray-400">拖放组件到这里</div>
        ) : null}
      </div>

      {!box.isConfirmed && (
        <div className="flex justify-end space-x-2 mt-2">
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
};

export default Box;