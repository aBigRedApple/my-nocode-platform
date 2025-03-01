"use client";
import { BoxData, ComponentInfo } from "./Box";

export default function PropertiesPanel({
  boxes,
  boxId,
  componentId,
  setBoxes,
}: {
  boxes: BoxData[];
  boxId: number | null;
  componentId: string | null;
  setBoxes: (boxes: BoxData[]) => void;
}) {
  if (!boxId || !componentId) return <div className="w-64 bg-white p-4 border-l border-gray-200" />;

  const box = boxes.find((b) => b.id === boxId);
  if (!box) return <div className="w-64 bg-white p-4 border-l border-gray-200" />;

  const component = box.isConfirmed
    ? box.confirmedComponents.find((comp) => comp.id === componentId)
    : box.pendingComponents.find((comp) => comp.id === componentId);

  if (!component) return <div className="w-64 bg-white p-4 border-l border-gray-200" />;

  const handlePropertyChange = (property: string, value: any) => {
    const newBoxes = boxes.map((b) =>
      b.id === boxId
        ? {
            ...b,
            confirmedComponents: b.isConfirmed
              ? b.confirmedComponents.map((c) =>
                  c.id === componentId ? { ...c, [property]: value } : c
                )
              : b.confirmedComponents,
            pendingComponents: !b.isConfirmed
              ? b.pendingComponents.map((c) =>
                  c.id === componentId ? { ...c, [property]: value } : c
                )
              : b.pendingComponents,
          }
        : b
    );
    setBoxes(newBoxes);
  };

  return (
    <div className="w-64 bg-white p-4 border-l border-gray-200">
      <h2 className="text-xl font-bold mb-4">属性面板</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">组件类型:</label>
          <input
            type="text"
            value={component.type}
            readOnly
            className="w-full p-1 border rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">高度:</label>
          <input
            type="number"
            value={component.height}
            onChange={(e) => handlePropertyChange("height", parseInt(e.target.value))}
            className="w-full p-1 border rounded"
          />
        </div>
      </div>
    </div>
  );
}