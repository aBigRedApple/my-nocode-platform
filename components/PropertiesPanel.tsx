"use client";
import { ChangeEvent } from "react";
import { BoxData, ComponentInfo, COMPONENT_DEFAULT_HEIGHTS } from "./Box";

interface PropertiesPanelProps {
  selectedBox: BoxData | null;
  selectedComponentIndex: number | null;
  onUpdateBox: (boxId: number, updatedBox: Partial<BoxData> | null) => void;
  onUpdateComponent: (
    boxId: number,
    componentIndex: number,
    updatedComponent: Partial<ComponentInfo> & { file?: File }
  ) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedBox,
  selectedComponentIndex,
  onUpdateBox,
  onUpdateComponent,
}) => {
  if (!selectedBox) {
    return (
      <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-3">属性面板</h3>
        <p className="text-gray-500">请选择一个盒子或组件</p>
      </div>
    );
  }

  const selectedComponent =
    selectedComponentIndex !== null && selectedComponentIndex >= 0
      ? [...selectedBox.confirmedComponents, ...selectedBox.pendingComponents][selectedComponentIndex] || null
      : null;

  const handlePropChange = (key: string, value: any) => {
    if (selectedComponent && selectedComponentIndex !== null) {
      const updatedProps = { ...selectedComponent.props, [key]: value };
      let newHeight = selectedComponent.height;

      if (selectedComponent.type === "table" && key === "rows") {
        newHeight = calculateTableHeight(value);
      }

      onUpdateComponent(selectedBox.id, selectedComponentIndex, {
        props: updatedProps,
        height: newHeight,
        width: selectedComponent.type === "table" ? "100%" : selectedComponent.width, // 表格固定为 100%
      });
    }
  };

  const handleSizeChange = (key: "width", value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newSize = { width: `${numericValue}%` };
    onUpdateBox(selectedBox.id, { size: newSize });
  };

  const handleDeleteComponent = () => {
    if (selectedComponent && selectedComponentIndex !== null) {
      const allComponents = [...selectedBox.confirmedComponents, ...selectedBox.pendingComponents];
      allComponents.splice(selectedComponentIndex, 1);
      const newBox = {
        ...selectedBox,
        confirmedComponents: allComponents.slice(0, selectedBox.confirmedComponents.length),
        pendingComponents: allComponents.slice(selectedBox.confirmedComponents.length),
      };
      onUpdateBox(selectedBox.id, newBox);
    }
  };

  const handleDeleteBox = () => {
    if (window.confirm("确定要删除这个区块吗？")) {
      onUpdateBox(selectedBox.id, null);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedComponent && selectedComponentIndex !== null) {
      const url = URL.createObjectURL(file);
      onUpdateComponent(selectedBox.id, selectedComponentIndex, {
        props: { ...selectedComponent.props, src: url },
        file,
      });
    }
  };

  const calculateTableHeight = (rows: number) => {
    const rowHeight = 40;
    const headerHeight = 40;
    return headerHeight + (rows - 1) * rowHeight;
  };

  return (
    <div className="w-64 bg-gray-50 border-l border-gray-200 h-full flex flex-col">
      <div className="sticky top-0 bg-gray-50 z-10 p-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-3">属性面板</h3>
        <div className="flex space-x-2">
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
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700">盒子属性</h4>
          <label className="block mt-2">
            宽度 (%):
            <input
              type="number"
              min="0"
              max="100"
              value={
                typeof selectedBox.size.width === "string"
                  ? parseFloat(selectedBox.size.width) || 100
                  : selectedBox.size.width
              }
              onChange={(e) => handleSizeChange("width", e.target.value)}
              className="w-full border p-1 mt-1 rounded"
            />
          </label>
        </div>

        {selectedComponent && (
          <div>
            <h4 className="font-semibold text-gray-700">组件属性</h4>
            <label className="block mt-2">
              宽度 (%):
              <input
                type="number"
                min="10"
                max="100"
                value={
                  typeof selectedComponent.width === "string"
                    ? parseFloat(selectedComponent.width) || 100
                    : selectedComponent.width
                }
                onChange={(e) =>
                  onUpdateComponent(selectedBox.id, selectedComponentIndex!, {
                    width: `${e.target.value}%`,
                  })
                }
                className="w-full border p-1 mt-1 rounded"
                disabled={selectedComponent.type === "table"} // 表格宽度固定为 100%
              />
            </label>
            <label className="block mt-2">
              高度 (px):
              <input
                type="number"
                min="20"
                value={selectedComponent.height || COMPONENT_DEFAULT_HEIGHTS[selectedComponent.type] || 40}
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
                    value={selectedComponent.props?.text || selectedComponent.props?.content || ""}
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
                内容:
                <textarea
                  value={selectedComponent.props?.content ?? ""}
                  onChange={(e) => handlePropChange("content", e.target.value)}
                  className="w-full border p-1 mt-1 rounded h-20"
                />
              </label>
            )}
            {selectedComponent.type === "radio" && (
              <>
                <label className="block mt-2">
                  标签:
                  <input
                    type="text"
                    value={selectedComponent.props?.label ?? ""}
                    onChange={(e) => handlePropChange("label", e.target.value)}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  选项 (用空格分隔):
                  <input
                    type="text"
                    value={selectedComponent.props?.options?.join(" ") ?? ""}
                    onChange={(e) => handlePropChange("options", e.target.value.split(" "))}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  选中项:
                  <input
                    type="text"
                    value={selectedComponent.props?.selected ?? ""}
                    onChange={(e) => handlePropChange("selected", e.target.value)}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
              </>
            )}
            {selectedComponent.type === "checkbox" && (
              <>
                <label className="block mt-2">
                  标签:
                  <input
                    type="text"
                    value={selectedComponent.props?.label ?? ""}
                    onChange={(e) => handlePropChange("label", e.target.value)}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  选项 (用空格分隔):
                  <input
                    type="text"
                    value={selectedComponent.props?.options?.join(" ") ?? ""}
                    onChange={(e) => handlePropChange("options", e.target.value.split(" "))}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  选中项 (用空格分隔):
                  <input
                    type="text"
                    value={selectedComponent.props?.selected?.join(" ") ?? ""}
                    onChange={(e) => handlePropChange("selected", e.target.value.split(" "))}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
              </>
            )}
            {selectedComponent.type === "image" && (
              <div className="mt-2">
                <label className="block">
                  上传图片:
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full mt-1"
                  />
                </label>
                {selectedComponent.props?.src && (
                  <img
                    src={selectedComponent.props.src}
                    alt="Preview"
                    className="mt-2 max-w-full rounded border border-gray-300"
                  />
                )}
              </div>
            )}
            {selectedComponent.type === "date" && (
              <label className="block mt-2">
                日期:
                <input
                  type="date"
                  value={selectedComponent.props?.value ?? ""}
                  onChange={(e) => handlePropChange("value", e.target.value)}
                  className="w-full border p-1 mt-1 rounded"
                />
              </label>
            )}
            {selectedComponent.type === "dateRange" && (
              <>
                <label className="block mt-2">
                  开始日期:
                  <input
                    type="date"
                    value={selectedComponent.props?.start ?? ""}
                    onChange={(e) => handlePropChange("start", e.target.value)}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  结束日期:
                  <input
                    type="date"
                    value={selectedComponent.props?.end ?? ""}
                    onChange={(e) => handlePropChange("end", e.target.value)}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
              </>
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
                      handlePropChange("data", e.target.value.split("\n").map((row) => row.split(" ")))
                    }
                    className="w-full border p-1 mt-1 rounded h-20"
                    placeholder="数据1 数据2\n数据3 数据4"
                  />
                </label>
              </>
            )}
            {selectedComponent.type === "card" && (
              <>
                <label className="block mt-2">
                  标题:
                  <input
                    type="text"
                    value={selectedComponent.props?.title ?? ""}
                    onChange={(e) => handlePropChange("title", e.target.value)}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  内容:
                  <textarea
                    value={selectedComponent.props?.content ?? ""}
                    onChange={(e) => handlePropChange("content", e.target.value)}
                    className="w-full border p-1 mt-1 rounded h-20"
                  />
                </label>
                <label className="block mt-2">
                  背景色:
                  <input
                    type="color"
                    value={selectedComponent.props?.backgroundColor || "#ffffff"}
                    onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                    className="w-full mt-1"
                  />
                </label>
                <div className="mt-2">
                  <label className="block">
                    上传图片:
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          onUpdateComponent(selectedBox.id, selectedComponentIndex!, {
                            props: { ...selectedComponent.props, imageSrc: url },
                            file,
                          });
                        }
                      }}
                      className="w-full mt-1"
                    />
                  </label>
                  {selectedComponent.props?.imageSrc && (
                    <img
                      src={selectedComponent.props.imageSrc}
                      alt="Preview"
                      className="mt-2 max-w-full rounded border border-gray-300"
                    />
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;