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
  { type: "card", label: "卡片" },
];

export interface ComponentPreviewProps {
  type: string;
  props?: Record<string, any>;
  width: string | number;
  height: number;
}

export const ComponentPreviewWithProps: React.FC<ComponentPreviewProps> = ({
  type,
  props = {},
  width,
  height,
}) => {
  const resolvedWidth = typeof width === "string" ? width : `${width}px`;

  switch (type) {
    case "button":
      return (
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          style={{ width: resolvedWidth, height, backgroundColor: props.bgColor || "#3b82f6", ...props.style }}
        >
          {props.text || props.content || "按钮"}
        </button>
      );
    case "text":
      return (
        <div
          className="text-sm whitespace-pre-wrap"
          style={{ width: resolvedWidth, height, ...props.style }}
        >
          {props.content || "文本"}
        </div>
      );
    case "radio":
      return (
        <div className="flex flex-col" style={{ width: resolvedWidth, height, ...props.style }}>
          <span className="text-sm mb-1">{props.label || "单选"}</span>
          {(props.options || ["选项1"]).map((option: string, index: number) => (
            <label key={index} className="flex items-center text-sm">
              <input
                type="radio"
                name={props.label || "radio"}
                value={option}
                checked={props.selected === option}
                className="mr-1"
                readOnly
              />
              {option}
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <div className="flex flex-col" style={{ width: resolvedWidth, height, ...props.style }}>
          <span className="text-sm mb-1">{props.label || "多选"}</span>
          {(props.options || ["选项1"]).map((option: string, index: number) => (
            <label key={index} className="flex items-center text-sm">
              <input
                type="checkbox"
                value={option}
                checked={(props.selected || []).includes(option)}
                className="mr-1"
                readOnly
              />
              {option}
            </label>
          ))}
        </div>
      );
    case "image":
      return props.src ? (
        <img
          src={props.src}
          alt="Component"
          className="object-cover"
          style={{ width: resolvedWidth, height, ...props.style }}
          onError={(e) => console.error("图片加载失败:", props.src)}
        />
      ) : (
        <div
          className="flex items-center justify-center text-sm"
          style={{ width: resolvedWidth, height, backgroundColor: "#e5e7eb", ...props.style }}
        >
          图片
        </div>
      );
    case "date":
      return (
        <input
          type="date"
          value={props.value || ""}
          className="border p-1 rounded text-sm"
          style={{ width: resolvedWidth, height, ...props.style }}
          readOnly
        />
      );
    case "dateRange":
      return (
        <div className="flex space-x-2" style={{ width: resolvedWidth, height, ...props.style }}>
          <input
            type="date"
            value={props.start || ""}
            className="border p-1 rounded text-sm"
            style={{ width: `calc(${resolvedWidth} / 2 - 8px)` }}
            readOnly
          />
          <input
            type="date"
            value={props.end || ""}
            className="border p-1 rounded text-sm"
            style={{ width: `calc(${resolvedWidth} / 2 - 8px)` }}
            readOnly
          />
        </div>
      );
    case "table":
      const columns = props.columns || 2;
      const rows = props.rows || 2;
      const headers = props.headers || ["表头1", "表头2"];
      const data = props.data || [["数据1", "数据2"], ["数据3", "数据4"]];
      return (
        <table className="border-collapse border text-sm" style={{ width: resolvedWidth, height, ...props.style }}>
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
    case "card":
      return (
        <div
          className="flex flex-col items-center"
          style={{ width: resolvedWidth, height, backgroundColor: props.backgroundColor || "#fff", ...props.style }}
        >
          {props.imageSrc && (
            <img
              src={props.imageSrc}
              alt={props.title || "Card"}
              className="object-cover"
              style={{ width: "100%", height: "50%", borderRadius: "8px 8px 0 0" }}
            />
          )}
          <div className="p-4 text-center" style={{ height: props.imageSrc ? "50%" : "100%" }}>
            <h3 className="font-semibold text-lg">{props.title || "标题"}</h3>
            <p className="text-sm text-gray-600">{props.content || "内容"}</p>
          </div>
        </div>
      );
    default:
      return <div style={{ width: resolvedWidth, height, ...props.style }}>{type}</div>;
  }
};

const DraggableComponent: React.FC<ComponentItem> = ({ type, label }) => {
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
};

const ComponentLibrary: React.FC = () => {
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
};

export default ComponentLibrary;