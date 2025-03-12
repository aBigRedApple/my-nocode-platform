"use client";
import { useRef, useMemo } from "react";
import { useDrop, useDrag } from "react-dnd";
import { ComponentPreviewWithProps } from "./ComponentLibrary";

export interface ComponentInfo {
  id?: number;
  type: string;
  width: string | number;
  height: number;
  props?: Record<string, unknown>;
  file?: File;
  column?: number;
}

export interface BoxData {
  id: number;
  position: { x: number; y: number };
  size: { width: string };
  order: number;
  layout?: {
    columns: number;
  };
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

interface DraggableComponentProps {
  component: ComponentInfo;
  index: number;
  boxId: number;
  columnWidth: string;
  onSelect: (boxId: number, index: number) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  index,
  boxId,
  columnWidth,
  onSelect,
  onMove,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "box-component",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "box-component",
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`mb-4 px-2 transition-opacity ${isDragging ? "opacity-50" : "opacity-100"}`}
      style={{ width: columnWidth }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(boxId, index);
      }}
    >
      <ComponentPreviewWithProps
        type={component.type}
        props={component.props}
        width="100%"
        height={component.height}
      />
    </div>
  );
};

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
  const [{ isOver }, dropBox] = useDrop({
    accept: "component",
    drop: (item: { type: string }, monitor) => {
      const baseHeight = COMPONENT_DEFAULT_HEIGHTS[item.type] || COMPONENT_DEFAULT_HEIGHTS.default;
      const dropClientOffset = monitor.getClientOffset();
      const boxRect = document.getElementById(`box-${box.id}`)?.getBoundingClientRect();
      
      if (dropClientOffset && boxRect && box.layout?.columns) {
        const relativeX = dropClientOffset.x - boxRect.left;
        const columnWidth = boxRect.width / box.layout.columns;
        const column = Math.floor(relativeX / columnWidth);
        
        const newComponent: ComponentInfo = {
          type: item.type,
          width: "100%",
          height: baseHeight,
          props: {},
          column: column,
        };
        onAddComponent(box.id, newComponent);
      } else {
        const newComponent: ComponentInfo = {
          type: item.type,
          width: "100%",
          height: baseHeight,
          props: {},
          column: 0,
        };
        onAddComponent(box.id, newComponent);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const allComponents = useMemo(
    () => [...box.confirmedComponents, ...box.pendingComponents],
    [box.confirmedComponents, box.pendingComponents]
  );

  const handleMoveComponent = (dragIndex: number, hoverIndex: number) => {
    const dragComponent = allComponents[dragIndex];
    const newComponents = [...allComponents];
    newComponents.splice(dragIndex, 1);
    newComponents.splice(hoverIndex, 0, dragComponent);
    
    onUpdateBox(box.id, {
      confirmedComponents: newComponents.slice(0, box.confirmedComponents.length),
      pendingComponents: newComponents.slice(box.confirmedComponents.length),
    });
  };

  const renderComponents = (components: ComponentInfo[]) => {
    if (!box.layout?.columns || box.layout.columns === 1) {
      return (
        <div className="flex flex-col">
          {components.map((comp, idx) => (
            <DraggableComponent
              key={`${comp.type}-${idx}`}
              component={comp}
              index={idx}
              boxId={box.id}
              columnWidth="100%"
              onSelect={onSelectComponent || (() => {})}
              onMove={handleMoveComponent}
            />
          ))}
        </div>
      );
    }

    // 创建列数组
    const columns = Array.from({ length: box.layout.columns }, (_, i) => i);
    
    return (
      <div className="flex -mx-2" style={{ minHeight: "50px" }}>
        {columns.map((colIndex) => (
          <div
            key={colIndex}
            className="px-2 flex flex-col"
            style={{ width: `${100 / box.layout!.columns}%` }}
          >
            {components
              .filter(comp => comp.column === colIndex)
              .map((comp, idx) => (
                <DraggableComponent
                  key={`${comp.type}-${idx}`}
                  component={comp}
                  index={allComponents.findIndex(c => c === comp)}
                  boxId={box.id}
                  columnWidth="100%"
                  onSelect={onSelectComponent || (() => {})}
                  onMove={handleMoveComponent}
                />
              ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      id={`box-${box.id}`}
      ref={dropBox}
      className={`p-4 flex flex-col ${
        !box.isConfirmed
          ? "border-2 border-blue-500"
          : index === totalBoxes - 1
          ? "border-b-0"
          : "border-b-2 border-dashed border-gray-300"
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
          renderComponents(allComponents)
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