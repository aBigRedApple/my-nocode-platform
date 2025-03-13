"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button, Spin, Modal, Input, Form } from "antd";
import { LeftOutlined, SaveOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { BoxData, ComponentInfo } from "@/components/Box";
import ComponentLibrary from "@/components/ComponentLibrary";
import PropertiesPanel from "@/components/PropertiesPanel";
import Workspace from "@/components/Workspace";
import axios from "@/utils/axios";
import html2canvas from "html2canvas"; // 引入 html2canvas

interface ApiLayoutData {
  id: number;
  name: string;
  description: string;
  boxes: Array<{
    id: number;
    positionX: number;
    positionY: number;
    width: string;
    layout?: { columns: number };
    components: Array<{
      id?: number;
      type: string;
      width: string;
      height: number;
      props: Record<string, unknown>;
      column?: number;
      file?: File;
    }>;
  }>;
}

interface ApiError {
  message: string;
  details?: string;
}

interface SavedBox {
  id: number;
  positionX: number;
  positionY: number;
  width: string;
  layout?: { columns: number };
  components: Array<{
    id: number;
    type: string;
    width: string;
    height: number;
    props: Record<string, unknown>;
    column?: number;
  }>;
}

interface SavedLayout {
  id: number;
  name: string;
  description: string | null;
  boxes: SavedBox[];
  preview?: string; // 添加 preview
}

const EditorPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [boxes, setBoxes] = useState<BoxData[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [layoutName, setLayoutName] = useState<string>("");
  const [layoutDescription, setLayoutDescription] = useState<string | null>(null);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [form] = Form.useForm();
  const workspaceRef = useRef<HTMLDivElement>(null); // 用于截图的引用

  useEffect(() => {
    const initPage = async () => {
      if (!id) return;

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("[Error] Token missing during data load");
        toast.error("请先登录");
        router.push("/auth/login");
        return;
      }

      setLoading(true);
      try {
        await loadProjectData(id);
      } catch (error) {
        console.error("[Error] Failed to load project data:", error);
        toast.error("加载项目数据失败");
        router.push("/profile");
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [id, router]);

  const loadProjectData = async (id: string) => {
    try {
      console.log("[Debug] Loading project data for ID:", id);
      const response = await axios.get<ApiLayoutData>(`/api/layouts/${id}`);
      const layoutData = response.data;
      console.log("[Debug] API Response:", layoutData);

      if (!layoutData || !Array.isArray(layoutData.boxes)) {
        console.error("[Error] Invalid layout data format");
        return;
      }

      const loadedBoxes = layoutData.boxes
        .map((box): BoxData | null => {
          if (!box || typeof box.id === "undefined") {
            console.error("[Error] Box is missing ID");
            return null;
          }

          const components = (box.components || []).map((comp) => {
            let props = comp.props || {};
            if (props.src && typeof props.src === "string" && !props.src.startsWith("http")) {
              props = { ...props, src: `${window.location.origin}${props.src}` };
            }

            return {
              id: comp.id,
              type: comp.type,
              width: comp.width,
              height: comp.height,
              props: props,
              column: comp.column,
              file: comp.file,
            };
          });

          return {
            id: box.id,
            position: { x: box.positionX, y: box.positionY },
            size: { width: box.width },
            layout: box.layout ? { columns: box.layout.columns } : undefined,
            confirmedComponents: components,
            pendingComponents: [],
            isConfirmed: true,
          };
        })
        .filter((box): box is BoxData => box !== null);

      console.log("[Debug] Processed boxes:", loadedBoxes);

      if (loadedBoxes.length === 0) {
        console.warn("[Warning] No valid boxes found in layout data");
      }

      setBoxes(loadedBoxes);
      setLayoutName(layoutData.name);
      setLayoutDescription(layoutData.description);
    } catch (error) {
      console.error("[Error] Failed to load project data:", error);
      throw error;
    }
  };

  const handleSave = () => {
    form.setFieldsValue({ name: layoutName, description: layoutDescription || "" });
    setIsSaveModalVisible(true);
  };

  const handleSaveConfirm = async (values: { name: string; description: string }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("请先登录");
        router.push("/auth/login");
        return;
      }

      // 生成截图
      if (!workspaceRef.current) {
        toast.error("无法生成预览图");
        return;
      }

      const canvas = await html2canvas(workspaceRef.current, { scale: 2 }); // 高清截图
      const previewBlob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((blob) => resolve(blob!), "image/png")
      );

      const formData = new FormData();

      const projectData = {
        name: values.name,
        description: values.description || null,
        boxes: boxes.map((box) => ({
          id: box.id,
          positionX: box.position.x,
          positionY: box.position.y,
          width: box.size.width,
          layout: { columns: box.layout?.columns || 1 },
          components: [...box.confirmedComponents, ...box.pendingComponents].map((comp, index) => ({
            id: comp.id,
            type: comp.type,
            width: comp.width,
            height: comp.height,
            props: comp.props
              ? { ...comp.props, src: comp.file ? undefined : comp.props.src }
              : {},
            column: comp.column || 0,
            fileIndex: comp.file ? index : undefined,
          })),
        })),
      };

      console.log("[Debug] Saving project data:", projectData);

      // 添加文件和截图
      boxes.forEach((box) => {
        [...box.confirmedComponents, ...box.pendingComponents].forEach((comp, index) => {
          if (comp.file) {
            formData.append(`image-${box.id}-${index}`, comp.file);
          }
        });
      });
      formData.append("preview", previewBlob, `preview-${id}.png`); // 添加截图
      formData.append("projectData", JSON.stringify(projectData));

      const response = await axios.put<SavedLayout>(`/api/layouts/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedLayout = response.data;

      const newBoxes: BoxData[] = updatedLayout.boxes.map((box) => ({
        id: box.id,
        position: { x: box.positionX, y: box.positionY },
        size: { width: box.width },
        layout: box.layout,
        confirmedComponents: box.components.map((comp) => ({
          id: comp.id,
          type: comp.type,
          width: comp.width,
          height: comp.height,
          props: comp.props,
          column: comp.column,
          file: undefined,
        })),
        pendingComponents: [],
        isConfirmed: true,
      }));

      setBoxes(newBoxes);
      toast.success("项目已保存");
      setIsSaveModalVisible(false);
      router.push("/profile");
    } catch (error: unknown) {
      console.error("Save error:", error);
      const apiError = error as ApiError;
      toast.error(apiError.message || "保存失败，请重试");
    }
  };

  const handleUpdateBox = (boxId: number, updatedBox: Partial<BoxData> | null) => {
    if (updatedBox === null) {
      setBoxes((prev) => prev.filter((box) => box.id !== boxId));
      setSelectedBoxId(null);
      return;
    }
    setBoxes((prev) => prev.map((box) => (box.id === boxId ? { ...box, ...updatedBox } : box)));
  };

  const handleUpdateComponent = (
    boxId: number,
    componentIndex: number,
    updatedComponent: Partial<ComponentInfo> & { file?: File }
  ) => {
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id !== boxId) return box;
        const allComponents = [...box.confirmedComponents, ...box.pendingComponents];
        allComponents[componentIndex] = { ...allComponents[componentIndex], ...updatedComponent };
        return {
          ...box,
          confirmedComponents: allComponents.slice(0, box.confirmedComponents.length),
          pendingComponents: allComponents.slice(box.confirmedComponents.length),
        };
      })
    );
  };

  const handleBack = () => {
    router.push("/profile");
  };

  if (loading) return <Spin size="large" className="flex justify-center items-center h-screen" />;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow-lg p-2 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-6">
          <Button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 border-none shadow-none"
            icon={<LeftOutlined />}
          >
            返回
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{layoutName}</h1>
            <p className="text-sm text-gray-600 mt-1 italic">{layoutDescription || "暂无描述"}</p>
          </div>
        </div>
        <Button
          type="primary"
          onClick={handleSave}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg shadow-md"
          icon={<SaveOutlined />}
        >
          更新
        </Button>
      </div>

      <div className="flex flex-1 overflow-x-hidden">
        <DndProvider backend={HTML5Backend}>
          <ComponentLibrary />
          <div ref={workspaceRef} className="flex-1">
            <Workspace
              className="bg-white p-8"
              boxes={boxes}
              setBoxes={setBoxes}
              onSelectBox={setSelectedBoxId}
              onSelectComponent={(boxId, index) => {
                setSelectedBoxId(boxId);
                setSelectedComponentIndex(index);
              }}
              isSave={false}
            />
          </div>
          <PropertiesPanel
            selectedBox={boxes.find((box) => box.id === selectedBoxId) || null}
            selectedComponentIndex={selectedComponentIndex}
            onUpdateBox={handleUpdateBox}
            onUpdateComponent={handleUpdateComponent}
          />
        </DndProvider>
      </div>

      <Modal
        title="更新项目"
        open={isSaveModalVisible}
        onCancel={() => setIsSaveModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSaveConfirm} layout="vertical">
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: "请输入项目名称" }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item name="description" label="项目描述">
            <Input placeholder="请输入项目描述（可选）" />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsSaveModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              确认保存
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default EditorPage;