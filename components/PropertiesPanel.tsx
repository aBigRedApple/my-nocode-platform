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

interface ComponentProps {
  [key: string]: unknown;
  text?: string;
  content?: string;
  bgColor?: string;
  src?: string;
  label?: string;
  options?: string[];
  selected?: string | string[];
  value?: string;
  start?: string;
  end?: string;
  columns?: number;
  rows?: number;
  headers?: string[];
  data?: string[][];
  title?: string;
  backgroundColor?: string;
  imageSrc?: string;
  style?: {
    fontSize?: number;
    color?: string;
    textAlign?: string;
  };
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

  const handlePropChange = (key: keyof ComponentProps, value: string | string[] | number | string[][]) => {
    if (selectedComponent && selectedComponentIndex !== null) {
      const updatedProps = { ...selectedComponent.props, [key]: value } as ComponentProps;
      let newHeight = selectedComponent.height;

      if (selectedComponent.type === "table" && key === "rows") {
        newHeight = calculateTableHeight(value as number);
      }

      onUpdateComponent(selectedBox.id, selectedComponentIndex, {
        props: updatedProps,
        height: newHeight,
        width: selectedComponent.type === "table" ? "100%" : selectedComponent.width,
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
        props: { ...selectedComponent.props, src: url } as ComponentProps,
        file,
      });
    }
  };

  const calculateTableHeight = (rows: number) => {
    const rowHeight = 40;
    const headerHeight = 40;
    return headerHeight + (rows - 1) * rowHeight;
  };

  const getComponentProps = (component: ComponentInfo): ComponentProps => {
    return component.props as ComponentProps;
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
          <label className="block mt-2">
            列数:
            <select
              value={selectedBox.layout?.columns || 1}
              onChange={(e) => {
                const columns = parseInt(e.target.value);
                onUpdateBox(selectedBox.id, {
                  layout: { columns },
                });
              }}
              className="w-full border p-1 mt-1 rounded"
            >
              <option value={1}>单列</option>
              <option value={2}>两列</option>
              <option value={3}>三列</option>
              <option value={4}>四列</option>
            </select>
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
                disabled={selectedComponent.type === "table"}
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
            {selectedBox.layout?.columns && selectedBox.layout.columns > 1 && (
              <label className="block mt-2">
                列位置:
                <select
                  value={selectedComponent.column || 0}
                  onChange={(e) =>
                    onUpdateComponent(selectedBox.id, selectedComponentIndex!, {
                      column: parseInt(e.target.value),
                    })
                  }
                  className="w-full border p-1 mt-1 rounded"
                >
                  {Array.from({ length: selectedBox.layout.columns }, (_, i) => (
                    <option key={i} value={i}>
                      第 {i + 1} 列
                    </option>
                  ))}
                </select>
              </label>
            )}

            {selectedComponent.type === "button" && (
              <>
                <label className="block mt-2">
                  文本:
                  <input
                    type="text"
                    value={getComponentProps(selectedComponent).text || getComponentProps(selectedComponent).content || ""}
                    onChange={(e) => handlePropChange("text", e.target.value)}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  背景色:
                  <input
                    type="color"
                    value={getComponentProps(selectedComponent).bgColor || "#3b82f6"}
                    onChange={(e) => handlePropChange("bgColor", e.target.value)}
                    className="w-full mt-1"
                  />
                </label>
              </>
            )}
            {selectedComponent.type === "text" && (
              <>
                <label className="block mt-2">
                  内容:
                  <textarea
                    value={getComponentProps(selectedComponent).content || ""}
                    onChange={(e) => handlePropChange("content", e.target.value)}
                    className="w-full border p-1 mt-1 rounded h-20"
                  />
                </label>
                <label className="block mt-2">
                  字体大小 (px):
                  <input
                    type="number"
                    min="10"
                    value={getComponentProps(selectedComponent).style?.fontSize || 14}
                    onChange={(e) => handlePropChange("style", { ...getComponentProps(selectedComponent).style, fontSize: parseInt(e.target.value) })}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  颜色:
                  <input
                    type="color"
                    value={getComponentProps(selectedComponent).style?.color || "#000000"}
                    onChange={(e) => handlePropChange("style", { ...getComponentProps(selectedComponent).style, color: e.target.value })}
                    className="w-full mt-1"
                  />
                </label>
                <label className="block mt-2">
                  对齐方式:
                  <select
                    value={getComponentProps(selectedComponent).style?.textAlign || "left"}
                    onChange={(e) => handlePropChange("style", { ...getComponentProps(selectedComponent).style, textAlign: e.target.value })}
                    className="w-full border p-1 mt-1 rounded"
                  >
                    <option value="left">左对齐</option>
                    <option value="center">居中</option>
                    <option value="right">右对齐</option>
                  </select>
                </label>
              </>
            )}
            {selectedComponent.type === "radio" && (
              <>
                <label className="block mt-2">
                  标签:
                  <input
                    type="text"
                    value={getComponentProps(selectedComponent).label || ""}
                    onChange={(e) => handlePropChange("label", e.target.value)}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  选项 (用空格分隔):
                  <input
                    type="text"
                    value={getComponentProps(selectedComponent).options?.join(" ") || ""}
                    onChange={(e) => handlePropChange("options", e.target.value.split(" "))}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  选中项:
                  <input
                    type="text"
                    value={getComponentProps(selectedComponent).selected || ""}
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
                    value={getComponentProps(selectedComponent).label || ""}
                    onChange={(e) => handlePropChange("label", e.target.value)}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  选项 (用空格分隔):
                  <input
                    type="text"
                    value={getComponentProps(selectedComponent).options?.join(" ") || ""}
                    onChange={(e) => handlePropChange("options", e.target.value.split(" "))}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  选中项 (用空格分隔):
                  <input
                    type="text"
                    value={
                      Array.isArray(getComponentProps(selectedComponent).selected)
                        ? (getComponentProps(selectedComponent).selected as string[]).join(" ")
                        : ""
                    }
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
                {getComponentProps(selectedComponent).src && (
                  <img
                    src={getComponentProps(selectedComponent).src}
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
                  value={getComponentProps(selectedComponent).value || ""}
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
                    value={getComponentProps(selectedComponent).start || ""}
                    onChange={(e) => handlePropChange("start", e.target.value)}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  结束日期:
                  <input
                    type="date"
                    value={getComponentProps(selectedComponent).end || ""}
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
                    value={getComponentProps(selectedComponent).columns || 2}
                    onChange={(e) => handlePropChange("columns", Number(e.target.value))}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  行数:
                  <input
                    type="number"
                    min="1"
                    value={getComponentProps(selectedComponent).rows || 2}
                    onChange={(e) => handlePropChange("rows", Number(e.target.value))}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  表头 (用空格分隔):
                  <input
                    type="text"
                    value={getComponentProps(selectedComponent).headers?.join(" ") || "表头1 表头2"}
                    onChange={(e) => handlePropChange("headers", e.target.value.split(/\s+/))}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  内容 (每列用空格分隔，每行用换行符分隔):
                  <textarea
                    value={
                      getComponentProps(selectedComponent).data
                        ?.map((row) => row.join(" "))
                        .join("\n") || "数据1 数据2\n数据3 数据4"
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
            {selectedComponent.type === "card" && (
              <>
                <label className="block mt-2">
                  标题:
                  <input
                    type="text"
                    value={getComponentProps(selectedComponent).title || ""}
                    onChange={(e) => handlePropChange("title", e.target.value)}
                    className="w-full border p-1 mt-1 rounded"
                  />
                </label>
                <label className="block mt-2">
                  内容:
                  <textarea
                    value={getComponentProps(selectedComponent).content || ""}
                    onChange={(e) => handlePropChange("content", e.target.value)}
                    className="w-full border p-1 mt-1 rounded h-20"
                  />
                </label>
                <label className="block mt-2">
                  背景色:
                  <input
                    type="color"
                    value={getComponentProps(selectedComponent).backgroundColor || "#ffffff"}
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
                            props: { ...getComponentProps(selectedComponent), imageSrc: url },
                            file,
                          });
                        }
                      }}
                      className="w-full mt-1"
                    />
                  </label>
                  {getComponentProps(selectedComponent).imageSrc && (
                    <img
                      src={getComponentProps(selectedComponent).imageSrc}
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