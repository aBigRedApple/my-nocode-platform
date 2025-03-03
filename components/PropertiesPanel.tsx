"use client";
import { BoxData, ComponentInfo } from "./Box";

interface PropertiesPanelProps {
  selectedBox: BoxData | null;
  selectedComponentIndex: number | null;
  onUpdateBox: (boxId: number, updatedBox: Partial<BoxData>) => void;
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

  const handlePropChange = (key: string, value: any) => {
    if (selectedComponent && selectedComponentIndex !== null) {
      const updatedProps = { ...selectedComponent.props, [key]: value };
      let newHeight = selectedComponent.height;
      if (selectedComponent.type === "table" && key === "rows") {
        newHeight = value * 20;
      }
      onUpdateComponent(selectedBox.id, selectedComponentIndex, {
        props: updatedProps,
        height: newHeight,
      });
    }
  };

  return (
    <div className="w-64 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-3">属性面板</h3>

      {/* 盒子属性 */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700">盒子属性</h4>
        <label className="block mt-2">
          X 坐标:
          <input
            type="number"
            min="0" // 限制负值
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
            min="0" // 限制负值
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
            min="0" // 限制负值
            value={selectedBox.size.width}
            onChange={(e) =>
              onUpdateBox(selectedBox.id, { size: { ...selectedBox.size, width: Number(e.target.value) } })
            }
            className="w-full border p-1 mt-1 rounded"
          />
        </label>
        <label className="block mt-2">
          高度:
          <input
            type="number"
            min="0" // 限制负值
            value={selectedBox.size.height}
            onChange={(e) =>
              onUpdateBox(selectedBox.id, { size: { ...selectedBox.size, height: Number(e.target.value) } })
            }
            className="w-full border p-1 mt-1 rounded"
          />
        </label>
      </div>

      {/* 组件属性 */}
      {selectedComponent && (
        <div>
          <h4 className="font-semibold text-gray-700">组件属性</h4>
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
                内容 (每行用空格分隔，行内用空格分隔):
                <textarea
                  value={
                    selectedComponent.props?.data
                      ?.map((row: string[]) => row.join(" "))
                      .join(" ") ?? "数据1 数据2 数据3 数据4"
                  }
                  onChange={(e) =>
                    handlePropChange(
                      "data",
                      e.target.value
                        .split(" ")
                        .map((row) => row.trim().split(/\s+/))
                    )
                  }
                  className="w-full border p-1 mt-1 rounded h-20"
                  placeholder="数据1 数据2 数据3 数据4"
                />
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
}