"use client";
import { useState, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import Box, { BoxData, ComponentInfo } from "./Box";
import { FaUndo, FaRedo, FaSave } from "react-icons/fa";
import axios from "../utils/axios";
import { Dialog, Transition } from "@headlessui/react";
import html2canvas from "html2canvas";
import { toast } from 'sonner';

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
  width: string;
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
  const router = useRouter();
  const [nextId, setNextId] = useState(1);
  const [history, setHistory] = useState<BoxData[][]>([boxes]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const workspaceRef = useRef<HTMLDivElement>(null);

  const saveHistory = (newBoxes: BoxData[]) => {
    const sortedBoxes = [...newBoxes].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(sortedBoxes);
    if (newHistory.length > 10) newHistory.shift();
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setBoxes(sortedBoxes);
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      const prevBoxes = history[currentIndex - 1];
      setBoxes(prevBoxes);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRedo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < history.length - 1) {
      const nextBoxes = history[currentIndex + 1];
      setBoxes(nextBoxes);
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
      toast.warning('请先登录', {
        description: '登录后即可保存项目',
      });
      router.push('/login');
      setSaving(false);
      setIsModalOpen(false);
      return;
    }

    let userId: number;
    try {
      const user = JSON.parse(userString) as { id: number };
      userId = user.id;
    } catch {
      toast.error('登录状态无效', {
        description: '请重新登录以继续操作',
      });
      router.push('/login');
      setSaving(false);
      setIsModalOpen(false);
      return;
    }

    // 生成预览图
    let screenshotBlob: Blob | null = null;
    if (workspaceRef.current) {
      try {
        const canvas = await html2canvas(workspaceRef.current.querySelector('.flex-1') as HTMLElement, {
          scale: 1,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        screenshotBlob = await new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!)));
      } catch (error) {
        console.error("生成截图失败:", error);
      }
    } else {
      console.error("工作区引用未找到");
    }

    const projectData = {
      project: {
        boxes: boxes.map((box) => ({
          id: box.id,
          positionX: box.position.x,
          positionY: box.position.y,
          width: box.size.width,
          sortOrder: box.sortOrder || 0,
          layout: box.layout,
          components: [...box.confirmedComponents, ...box.pendingComponents].map((comp, index) => ({
            id: comp.id,
            type: comp.type,
            width: comp.width,
            height: comp.height,
            props: { ...comp.props, src: comp.file ? undefined : comp.props?.src },
            fileIndex: comp.file ? index : undefined,
            column: comp.column,
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

    if (screenshotBlob) {
      formData.append("preview", screenshotBlob, `${projectName}-preview.png`);
    } else {
      console.warn("未生成 preview 截图");
    }

    formData.append("projectData", JSON.stringify(projectData));

    try {
      const response = await axios.post<{ layoutId: number; boxes: SavedBox[] }>("/api/project/save", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const savedProject = response.data;
      const updatedBoxes: BoxData[] = boxes.map((originalBox) => {
        const savedBox = savedProject.boxes.find((b) => b.id === originalBox.id);
        if (!savedBox) return originalBox;
        return {
          ...originalBox,
          position: { x: savedBox.positionX, y: savedBox.positionY },
          size: { width: savedBox.width },
          confirmedComponents: savedBox.components.map((comp) => ({
            id: comp.id,
            type: comp.type,
            width: comp.width,
            height: comp.height,
            props: comp.props,
            file: undefined,
          })),
          pendingComponents: [],
          isConfirmed: true,
        };
      });

      saveHistory(updatedBoxes);
      setTimeout(() => {
        setBoxes([]);
        setHistory([[]]);
        setCurrentIndex(0);
        setNextId(1);
      }, 1000);

      setIsModalOpen(false);
      setProjectName("");
      setProjectDesc("");
      toast.success('保存成功', {
        description: '项目已保存，可在个人中心查看',
      });
    } catch {
      toast.error('保存失败', {
        description: '保存项目时发生错误，请重试',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleWorkspaceClick = () => {
    const newBox: BoxData = {
      id: nextId,
      position: { x: 0, y: 0 },
      size: { width: "100%" },
      sortOrder: boxes.length,
      confirmedComponents: [],
      pendingComponents: [],
      isConfirmed: false,
    };
    setNextId(nextId + 1);
    saveHistory([...boxes, newBox]);
  };

  const handleUpdateBox = (boxId: number, updatedBox: Partial<BoxData> | null) => {
    if (updatedBox === null) {
      const newBoxes = boxes.filter((box) => box.id !== boxId);
      saveHistory(newBoxes);
      setBoxes(newBoxes);
      onSelectBox?.(null);
      return;
    }
    const newBoxes = boxes.map((box) => (box.id === boxId ? { ...box, ...updatedBox } : box));
    saveHistory(newBoxes);
    setBoxes(newBoxes);
  };

  return (
    <div ref={workspaceRef} className={`flex flex-col h-full ${className || ""}`} onClick={handleWorkspaceClick}>
      <div className="h-8 flex-shrink-0 flex justify-center items-center space-x-2 bg-white">
        <button
          onClick={handleUndo}
          disabled={currentIndex <= 0}
          className={`p-2 rounded ${currentIndex <= 0 ? "text-gray-300" : "text-blue-500 hover:bg-blue-100"}`}
        >
          <FaUndo />
        </button>
        <button
          onClick={handleRedo}
          disabled={currentIndex >= history.length - 1}
          className={`p-2 rounded ${currentIndex >= history.length - 1 ? "text-gray-300" : "text-blue-500 hover:bg-blue-100"}`}
        >
          <FaRedo />
        </button>
        {isSave && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`p-2 rounded ${saving ? "text-gray-300" : "text-green-500 hover:bg-green-100"}`}
          >
            <FaSave />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {boxes.map((box, index) => (
          <Box
            key={box.id}
            box={box}
            index={index}
            totalBoxes={boxes.length}
            onConfirm={(id) => {
              const boxToConfirm = boxes.find((b) => b.id === id);
              if (!boxToConfirm) return;
              if (boxToConfirm.confirmedComponents.length === 0 && boxToConfirm.pendingComponents.length === 0) {
                handleUpdateBox(id, null);
              } else {
                const newBoxes = boxes.map((b) =>
                  b.id === id
                    ? {
                        ...b,
                        confirmedComponents: [...b.confirmedComponents, ...b.pendingComponents],
                        pendingComponents: [],
                        isConfirmed: true,
                      }
                    : b
                );
                saveHistory(newBoxes);
              }
            }}
            onCancel={(id) => {
              const boxToCancel = boxes.find((b) => b.id === id);
              if (!boxToCancel) return;
              if (boxToCancel.confirmedComponents.length === 0 && boxToCancel.pendingComponents.length === 0) {
                handleUpdateBox(id, null);
              } else {
                const newBoxes = boxes.map((b) =>
                  b.id === id ? { ...b, pendingComponents: [], isConfirmed: true } : b
                );
                saveHistory(newBoxes);
              }
            }}
            onClick={(id) => {
              onSelectBox?.(id);
              const newBoxes = boxes.map((b) => (b.id === id ? { ...b, isConfirmed: false } : b));
              saveHistory(newBoxes);
            }}
            onAddComponent={(boxId, component) => {
              const newBoxes = boxes.map((b) =>
                b.id === boxId ? { ...b, pendingComponents: [...b.pendingComponents, component] } : b
              );
              saveHistory(newBoxes);
            }}
            onSelectComponent={onSelectComponent}
            onUpdateBox={handleUpdateBox}
          />
        ))}
      </div>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={() => setIsModalOpen(false)}>
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
    </div>
  );
};

export default Workspace;