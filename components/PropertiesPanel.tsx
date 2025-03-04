"use client";
import { BoxData, ComponentInfo } from "./Box";
import { COMPONENT_DEFAULT_HEIGHTS } from "./Box";

interface PropertiesPanelProps {
  selectedBox: BoxData | null;
  selectedComponentIndex: number | null;
  onUpdateBox: (boxId: number, updatedBox: Partial<BoxData> | null) => void;
  onUpdateComponent: (boxId: number, componentIndex: number, updatedComponent: Partial<ComponentInfo>) => void;
}

export default function PropertiesPanel({
  selectedBox,
  selectedComponentIndex,
  onUpdateBox,
  onUpdateComponent,
}: PropertiesPanelProps) {
  if (!selectedBox) {
    return (
      <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-3">属性面板</h3>
        <p className="text-gray-500">请选择一个盒子或组件</p>
      </div>
    );
  }

  const buttonOffset = 32;
  const selectedComponent =
    selectedComponentIndex !== null && selectedComponentIndex >= 0
      ? [...selectedBox.confirmedComponents, ...selectedBox.pendingComponents][selectedComponentIndex]
      : null;

  const calculateMinSize = (box: BoxData) => {
    const allComponents = [...box.confirmedComponents, ...box.pendingComponents];
    const minWidth = Math.max(...allComponents.map((comp) => comp.width || 135), 135); // 最小宽度 135px
    const minHeight =
      allComponents.reduce(
        (sum, comp) => sum + (comp.height || COMPONENT_DEFAULT_HEIGHTS[comp.type] || 60) + 16,
        0
      ) -
      16 +
      32; // padding 32，间距 16
    return { minWidth, minHeight };
  };

  const calculateTableHeight = (rows: number) => {
    const rowHeight = 40; // 每行 40px
    const headerHeight = 40; // 表头 40px
    return headerHeight + (rows - 1) * rowHeight; // 动态计算
  };

  const calculateTableWidth = (columns: number) => {
    const columnWidth = 50; // 每列基准宽度 50px
    return Math.max(columns * columnWidth, 100); // 最小宽度 100px
  };

  const handlePropChange = (key: string, value: any) => {
    if (selectedComponent && selectedComponentIndex !== null) {
      const updatedProps = { ...selectedComponent.props, [key]: value };
      let newHeight = selectedComponent.height;
      let newWidth = selectedComponent.width;

      if (selectedComponent.type === "table") {
        if (key === "rows") {
          newHeight = calculateTableHeight(value); // 更新组件高度
        }
        if (key === "columns") {
          newWidth = calculateTableWidth(value); // 更新组件宽度
        }
      }

      onUpdateComponent(selectedBox.id, selectedComponentIndex, {
        props: updatedProps,
        height: newHeight,
        width: newWidth,
      });
    }
  };

  const handleSizeChange = (key: "width" | "height", value: number) => {
    const { minWidth, minHeight } = calculateMinSize(selectedBox);
    const newValue = key === "width" ? Math.max(value, 135) : value; // 宽度最小值 135px
    const newSize = { ...selectedBox.size, [key]: newValue };

    if (newSize.width < minWidth || newSize.height < minHeight) {
      const confirmShrink = window.confirm(
        `盒子${key === "width" ? "宽度" : "高度"}将小于组件需求（最小${key === "width" ? minWidth : minHeight}px），还要继续缩小吗？再次缩小将删除最后一个组件。`
      );
      if (confirmShrink) {
        const allComponents = [...selectedBox.confirmedComponents, ...selectedBox.pendingComponents];
        if (allComponents.length > 0) {
          const newBoxes = {
            ...selectedBox,
            pendingComponents: allComponents.slice(0, -1),
            confirmedComponents: [],
            size: newSize,
          };
          onUpdateBox(selectedBox.id, newBoxes);
        }
      }
    } else {
      onUpdateBox(selectedBox.id, { size: newSize });
    }
  };

  const handleDeleteComponent = () => {
    if (selectedComponent && selectedComponentIndex !== null) {
      const allComponents = [...selectedBox.confirmedComponents, ...selectedBox.pendingComponents];
      allComponents.splice(selectedComponentIndex, 1);
      const newBoxes = {
        ...selectedBox,
        confirmedComponents: allComponents.slice(0, selectedBox.confirmedComponents.length),
        pendingComponents: allComponents.slice(selectedBox.confirmedComponents.length),
      };
      onUpdateBox(selectedBox.id, newBoxes);
    }
  };

  const handleDeleteBox = () => {
    if (window.confirm("确定要删除这个区块吗？")) {
      onUpdateBox(selectedBox.id, null);
    }
  };

  return (
    <div className="w-64 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-3">属性面板</h3>
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleDeleteBox}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          删除区块
        </button>
        {selectedComponent && (
          <button
            onClick={handleDeleteComponent}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            删除组件
          </button>
        )}
      </div>

      {/* 盒子属性 */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700">盒子属性</h4>
        <label className="block mt-2">
          X 坐标:
          <input
            type="number"
            min="0"
            value={selectedBox.position.x}
            onChange={(e) =>
              onUpdateBox(selectedBox.id, { position: { ...selectedBox.position, x: Number(e.target.value) } })
            }
            className="w-full border p-1 mt-1 rounded"
          />
        </label>
        <label className="block mt-2">
          Y 坐标 (相对于按钮下方):
          <input
            type="number"
            min="0"
            value={selectedBox.position.y}
            onChange={(e) =>
              onUpdateBox(selectedBox.id, { position: { ...selectedBox.position, y: Number(e.target.value) } })
            }
            className="w-full border p-1 mt-1 rounded"
          />
        </label>
        <label className="block mt-2">
          宽度:
          <input
            type="number"
            min="135" // 最小宽度 135px
            value={selectedBox.size.width}
            onChange={(e) => handleSizeChange("width", Number(e.target.value))}
            className="w-full border p-1 mt-1 rounded"
          />
        </label>
        <label className="block mt-2">
          高度:
          <input
            type="number"
            min="0"
            value={selectedBox.size.height}
            onChange={(e) => handleSizeChange("height", Number(e.target.value))}
            className="w-full border p-1 mt-1 rounded"
          />
        </label>
      </div>

      {/* 组件属性 */}
      {selectedComponent && (
        <div>
          <h4 className="font-semibold text-gray-700">组件属性</h4>
          <label className="block mt-2">
            宽度:
            <input
              type="number"
              min="50"
              value={selectedComponent.width}
              onChange={(e) =>
                onUpdateComponent(selectedBox.id, selectedComponentIndex!, {
                  width: Number(e.target.value),
                })
              }
              className="w-full border p-1 mt-1 rounded"
            />
          </label>
          <label className="block mt-2">
            高度:
            <input
              type="number"
              min="20"
              value={selectedComponent.height}
              onChange={(e) =>
                onUpdateComponent(selectedBox.id, selectedComponentIndex!, {
                  height: Number(e.target.value),
                })
              }
              className="w-full border p-1 mt-1 rounded"
            />
          </label>
          {selectedComponent.type === "button" && (
            <>
              <label className="block mt-2">
                文本:
                <input
                  type="text"
                  value={selectedComponent.props?.text ?? ""}
                  onChange={(e) => handlePropChange("text", e.target.value)}
                  className="w-full border p-1 mt-1 rounded"
                />
              </label>
              <label className="block mt-2">
                背景色:
                <input
                  type="color"
                  value={selectedComponent.props?.bgColor || "#3b82f6"}
                  onChange={(e) => handlePropChange("bgColor", e.target.value)}
                  className="w-full mt-1"
                />
              </label>
            </>
          )}
          {selectedComponent.type === "text" && (
            <label className="block mt-2">
              Placeholder:
              <input
                type="text"
                value={selectedComponent.props?.placeholder ?? ""}
                onChange={(e) => handlePropChange("placeholder", e.target.value)}
                className="w-full border p-1 mt-1 rounded"
              />
            </label>
          )}
          {selectedComponent.type === "radio" && (
            <label className="block mt-2">
              标签:
              <input
                type="text"
                value={selectedComponent.props?.label ?? ""}
                onChange={(e) => handlePropChange("label", e.target.value)}
                className="w-full border p-1 mt-1 rounded"
              />
            </label>
          )}
          {selectedComponent.type === "checkbox" && (
            <label className="block mt-2">
              标签:
              <input
                type="text"
                value={selectedComponent.props?.label ?? ""}
                onChange={(e) => handlePropChange("label", e.target.value)}
                className="w-full border p-1 mt-1 rounded"
              />
            </label>
          )}
          {selectedComponent.type === "image" && (
            <label className="block mt-2">
              图片URL:
              <input
                type="text"
                value={selectedComponent.props?.src ?? ""}
                onChange={(e) => handlePropChange("src", e.target.value)}
                className="w-full border p-1 mt-1 rounded"
              />
            </label>
          )}
          {selectedComponent.type === "date" && (
            <></> // 无额外属性，但支持宽度高度调整
          )}
          {selectedComponent.type === "dateRange" && (
            <></> // 无额外属性，但支持宽度高度调整
          )}
          {selectedComponent.type === "table" && (
            <>
              <label className="block mt-2">
                列数:
                <input
                  type="number"
                  min="1"
                  value={selectedComponent.props?.columns ?? 2}
                  onChange={(e) => handlePropChange("columns", Number(e.target.value))}
                  className="w-full border p-1 mt-1 rounded"
                />
              </label>
              <label className="block mt-2">
                行数:
                <input
                  type="number"
                  min="1"
                  value={selectedComponent.props?.rows ?? 2}
                  onChange={(e) => handlePropChange("rows", Number(e.target.value))}
                  className="w-full border p-1 mt-1 rounded"
                />
              </label>
              <label className="block mt-2">
                表头 (用空格分隔):
                <input
                  type="text"
                  value={selectedComponent.props?.headers?.join(" ") ?? "表头1 表头2"}
                  onChange={(e) => handlePropChange("headers", e.target.value.split(/\s+/))}
                  className="w-full border p-1 mt-1 rounded"
                />
              </label>
              <label className="block mt-2">
                内容 (每列用空格分隔，每行用换行符分隔):
                <textarea
                  value={
                    selectedComponent.props?.data
                      ?.map((row: string[]) => row.join(" "))
                      .join("\n") ?? "数据1 数据2\n数据3 数据4"
                  }
                  onChange={(e) =>
                    handlePropChange(
                      "data",
                      e.target.value.split("\n").map((row) => row.split(" "))
                    )
                  }
                  className="w-full border p-1 mt-1 rounded h-20"
                  placeholder="数据1 数据2\n数据3 数据4"
                />
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
}