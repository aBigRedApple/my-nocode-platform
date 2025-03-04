"use client";
import { useDrag } from "react-dnd";
import { useState } from "react";

interface ComponentItem {
  type: string;
  label: string;
}

const components: ComponentItem[] = [
  { type: "button", label: "按钮" },
  { type: "text", label: "文本" },
  { type: "radio", label: "单选" },
  { type: "checkbox", label: "多选" },
  { type: "image", label: "图片" },
  { type: "date", label: "日期" },
  { type: "dateRange", label: "日期区间" },
  { type: "table", label: "表格" },
];

export function ComponentPreviewWithProps({
  type,
  props = {},
  width,
  height,
}: {
  type: string;
  props?: Record<string, any>;
  width: number;
  height: number;
}) {
  switch (type) {
    case "button":
      return (
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          style={{ width, height, backgroundColor: props.bgColor || "#3b82f6" }}
        >
          {props.text || "按钮"}
        </button>
      );
    case "text":
      return (
        <input
          type="text"
          placeholder={props.placeholder || "文本"}
          className="border p-1 rounded w-full text-sm"
          style={{ width, height }}
        />
      );
    case "radio":
      return (
        <div className="flex items-center" style={{ width, height }}>
          <input type="radio" id="radio" name="radio" className="mr-1" />
          <label htmlFor="radio" className="text-sm">
            {props.label || "单选"}
          </label>
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center" style={{ width, height }}>
          <input type="checkbox" id="checkbox" className="mr-1" />
          <label htmlFor="checkbox" className="text-sm">
            {props.label || "多选"}
          </label>
        </div>
      );
    case "image":
      return (
        <div
          className="flex items-center justify-center text-sm"
          style={{
            width,
            height,
            backgroundImage: props.src ? `url(${props.src})` : "none",
            backgroundSize: "cover",
            backgroundColor: props.src ? "transparent" : "#e5e7eb",
          }}
        >
          {!props.src && "图片"}
        </div>
      );
    case "date":
      return (
        <input
          type="date"
          className="border p-1 rounded text-sm"
          style={{ width, height }}
        />
      );
    case "dateRange":
      return (
        <div className="flex space-x-1" style={{ width, height }}>
          <input type="date" className="border p-1 rounded text-sm" style={{ width: width / 2 - 4 }} /> {/* 均分宽度 */}
          <input type="date" className="border p-1 rounded text-sm" style={{ width: width / 2 - 4 }} />
        </div>
      );
    case "table":
      const columns = props.columns || 2;
      const rows = props.rows || 2;
      const headers = props.headers || ["表头1", "表头2"];
      const data = props.data || [["数据1", "数据2"], ["数据3", "数据4"]];
      return (
        <table className="border-collapse border text-sm" style={{ width, height }}>
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <th key={colIndex} className="border p-1">
                  {headers[colIndex] || `表头${colIndex + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows - 1 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="border p-1">
                    {data[rowIndex]?.[colIndex] || `数据${rowIndex * columns + colIndex + 1}`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    default:
      return <div style={{ width, height }}>{type}</div>;
  }
}

export default function ComponentLibrary() {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredComponents = components.filter((comp) =>
    comp.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 sticky top-0 bg-gray-50 z-10">
        <h3 className="text-xl font-bold text-gray-800 mb-3">组件库</h3>
        <input
          type="text"
          placeholder="搜索组件..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white shadow-sm text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pt-0">
        <div className="space-y-3">
          {filteredComponents.map((comp) => (
            <DraggableComponent key={comp.type} type={comp.type} label={comp.label} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DraggableComponent({ type, label }: ComponentItem) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "component",
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-3 bg-white rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <ComponentPreviewWithProps type={type} width={100} height={40} />
      <p className="text-xs text-gray-500 mt-1.5">{label}</p>
    </div>
  );
}