"use client";
import { useState, useRef, Fragment } from "react";
import Box, { BoxData, ComponentInfo } from "./Box";
import { FaUndo, FaRedo, FaSave } from "react-icons/fa";
import axios from "../utils/axios";
import { Dialog, Transition } from "@headlessui/react";

interface WorkspaceProps {
  className?: string;
  boxes: BoxData[];
  setBoxes: (boxes: BoxData[]) => void;
  onSelectBox?: (boxId: number | null) => void;
  onSelectComponent?: (boxId: number, componentIndex: number | null) => void;
  isSave?: boolean;
}

interface SavedBox {
  id: number;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  components: ComponentInfo[];
}

const Workspace: React.FC<WorkspaceProps> = ({
  className,
  boxes,
  setBoxes,
  onSelectBox,
  onSelectComponent,
  isSave = true,
}) => {
  const [nextId, setNextId] = useState(1);
  const [history, setHistory] = useState<BoxData[][]>([[]]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const workspaceRef = useRef<HTMLDivElement>(null);
  const buttonBarRef = useRef<HTMLDivElement>(null);

  const saveHistory = (newBoxes: BoxData[]) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newBoxes);
    if (newHistory.length > 10) newHistory.shift();
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setBoxes(history[currentIndex - 1]);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRedo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < history.length - 1) {
      setBoxes(history[currentIndex + 1]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    const formData = new FormData();

    const userString = localStorage.getItem("user");
    if (!userString) {
      alert("请先登录！");
      setSaving(false);
      setIsModalOpen(false);
      return;
    }

    let userId: number;
    try {
      const user = JSON.parse(userString) as { id: number };
      userId = user.id;
    } catch (error) {
      console.error("解析 user 数据失败:", error);
      alert("用户信息无效，请重新登录！");
      setSaving(false);
      setIsModalOpen(false);
      return;
    }

    const projectData = {
      project: {
        boxes: boxes.map((box) => ({
          id: box.id,
          positionX: box.position.x,
          positionY: box.position.y,
          width: box.size.width,
          height: box.size.height,
          components: [...box.confirmedComponents, ...box.pendingComponents].map((comp, index) => ({
            id: comp.id,
            type: comp.type,
            width: comp.width,
            height: comp.height,
            props: {
              ...comp.props,
              // 如果有 file，清空 src，依赖后端生成 URL
              src: comp.file ? undefined : comp.props?.src,
            },
            fileIndex: comp.file ? index : undefined,
          })),
        })),
      },
      userId,
      name: projectName,
      description: projectDesc,
    };

    boxes.forEach((box) => {
      [...box.confirmedComponents, ...box.pendingComponents].forEach((comp, index) => {
        if (comp.file) {
          formData.append(`image-${box.id}-${index}`, comp.file);
        }
      });
    });

    formData.append("projectData", JSON.stringify(projectData));

    try {
      const response = await axios.post<{ layoutId: number; boxes: SavedBox[] }>(
        "/api/project/save",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const savedProject = response.data;

      const newBoxes: BoxData[] = savedProject.boxes.map((box) => ({
        id: box.id,
        position: { x: box.positionX, y: box.positionY },
        size: { width: box.width, height: box.height },
        confirmedComponents: box.components.map((comp) => ({
          id: comp.id,
          type: comp.type,
          width: comp.width,
          height: comp.height,
          props: comp.props, // 使用后端返回的 props
          file: undefined,
        })),
        pendingComponents: [],
        isConfirmed: true,
      }));

      setBoxes(newBoxes);
      setTimeout(() => {
        setBoxes([]);
        setHistory([[]]);
        setCurrentIndex(0);
        setNextId(1);
      }, 1000);

      setIsModalOpen(false);
      setProjectName("");
      setProjectDesc("");
      alert(`项目 "${projectName}" 保存成功！工作区已清空。`);
    } catch (error) {
      console.error("Save error:", error);
      alert("保存失败，请重试！");
    } finally {
      setSaving(false);
    }
  };

  const getButtonOffset = () => {
    if (buttonBarRef.current) {
      const buttonRect = buttonBarRef.current.getBoundingClientRect();
      return buttonRect.height + 8;
    }
    return 32;
  };

  const handleWorkspaceClick = (e: React.MouseEvent) => {
    if (!workspaceRef.current) return;

    const rect = workspaceRef.current.getBoundingClientRect();
    const buttonOffset = getButtonOffset();
    const paddingOffset = 32;
    let x = e.clientX - rect.left - paddingOffset;
    let y = e.clientY - rect.top - buttonOffset;

    const boxWidth = 300;
    const workspaceWidth = rect.width - 2 * paddingOffset;

    if (x + boxWidth > workspaceWidth) return;

    const isClickInUnconfirmedBox = boxes.some(
      (box) =>
        !box.isConfirmed &&
        x >= box.position.x &&
        x <= box.position.x + box.size.width &&
        y >= box.position.y &&
        y <= box.position.y + box.size.height
    );
    if (isClickInUnconfirmedBox) return;

    const clickedConfirmedBox = boxes.find(
      (box) =>
        box.isConfirmed &&
        x >= box.position.x &&
        x <= box.position.x + box.size.width &&
        y >= box.position.y &&
        y <= box.position.y + box.size.height
    );
    if (clickedConfirmedBox) {
      onSelectBox?.(clickedConfirmedBox.id);
      return;
    }

    onSelectBox?.(null);
    onSelectComponent?.(0, null);

    x = Math.max(x, 0);
    y = Math.max(y, 0);

    const newBox: BoxData = {
      id: nextId,
      position: { x, y },
      size: { width: 300, height: 350 },
      confirmedComponents: [],
      pendingComponents: [],
      isConfirmed: false,
    };

    const newBoxes = [...boxes, newBox];
    setBoxes(newBoxes);
    setNextId(nextId + 1);
    saveHistory(newBoxes);
  };

  const handleUpdateBox = (boxId: number, updatedBox: Partial<BoxData> | null) => {
    let newBoxes: BoxData[];
    if (updatedBox === null) {
      newBoxes = boxes.filter((b) => b.id !== boxId);
      onSelectBox?.(null);
    } else {
      newBoxes = boxes.map((b) => (b.id === boxId ? { ...b, ...updatedBox } : b));
    }
    setBoxes(newBoxes);
    saveHistory(newBoxes);
  };

  return (
    <div
      ref={workspaceRef}
      className={`relative ${className || ""}`}
      onClick={handleWorkspaceClick}
      style={{ minHeight: "500px", overflowY: "auto" }}
    >
      <div
        ref={buttonBarRef}
        className="absolute top-2 left-1/2 transform -translate-x-1/2 flex space-x-2"
      >
        <button
          onClick={handleUndo}
          disabled={currentIndex <= 0}
          className={`p-2 rounded ${
            currentIndex <= 0 ? "text-gray-300 cursor-not-allowed" : "text-blue-500 hover:bg-blue-100"
          }`}
        >
          <FaUndo />
        </button>
        <button
          onClick={handleRedo}
          disabled={currentIndex >= history.length - 1}
          className={`p-2 rounded ${
            currentIndex >= history.length - 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-blue-500 hover:bg-blue-100"
          }`}
        >
          <FaRedo />
        </button>
        {isSave && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`p-2 rounded ${
              saving ? "text-gray-300 cursor-not-allowed" : "text-green-500 hover:bg-green-100"
            }`}
          >
            <FaSave />
          </button>
        )}
      </div>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    保存项目
                  </Dialog.Title>
                  <div className="mt-2">
                    <label className="block">
                      项目名称:
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full border p-2 mt-1 rounded"
                        placeholder="请输入项目名称"
                      />
                    </label>
                    <label className="block mt-2">
                      项目描述:
                      <textarea
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        className="w-full border p-2 mt-1 rounded"
                        placeholder="请输入项目描述（可选）"
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      onClick={() => setIsModalOpen(false)}
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={confirmSave}
                      disabled={saving || !projectName}
                    >
                      {saving ? "保存中..." : "保存"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {boxes.map((box) => (
        <div
          key={box.id}
          style={{
            position: "absolute",
            left: box.position.x + 32,
            top: box.position.y + getButtonOffset(),
          }}
        >
          <Box
            box={box}
            onConfirm={(id) => {
              const boxToConfirm = boxes.find((b) => b.id === id);
              if (!boxToConfirm) return;
              const allComponents = [...boxToConfirm.confirmedComponents, ...boxToConfirm.pendingComponents];
              const totalComponentHeight = allComponents.reduce(
                (sum, comp) => sum + comp.height,
                0
              );
              const marginsHeight = allComponents.length > 1 ? (allComponents.length - 1) * 16 : 0;
              const padding = 32;
              const newHeight = Math.max(totalComponentHeight + marginsHeight + padding, 350);
              const newBoxes = boxes.map((b) =>
                b.id === id
                  ? {
                      ...b,
                      confirmedComponents: allComponents,
                      pendingComponents: [],
                      isConfirmed: true,
                      size: { ...b.size, height: newHeight },
                    }
                  : b
              );
              setBoxes(newBoxes);
              saveHistory(newBoxes);
            }}
            onCancel={(id) => {
              const boxToCancel = boxes.find((b) => b.id === id);
              if (!boxToCancel) return;
              const newBoxes = boxes.map((b) =>
                b.id === id
                  ? {
                      ...b,
                      pendingComponents: [],
                      isConfirmed: true,
                    }
                  : b
              );
              setBoxes(newBoxes);
              saveHistory(newBoxes);
            }}
            onClick={(id) => {
              onSelectBox?.(id);
              const newBoxes = boxes.map((b) =>
                b.id === id ? { ...b, isConfirmed: false } : b
              );
              setBoxes(newBoxes);
              saveHistory(newBoxes);
            }}
            onAddComponent={(boxId, component) => {
              const newBoxes = boxes.map((b) =>
                b.id === boxId ? { ...b, pendingComponents: [...b.pendingComponents, component] } : b
              );
              setBoxes(newBoxes);
              saveHistory(newBoxes);
            }}
            onSelectComponent={onSelectComponent}
            onUpdateBox={handleUpdateBox}
          />
        </div>
      ))}
    </div>
  );
};

export default Workspace;