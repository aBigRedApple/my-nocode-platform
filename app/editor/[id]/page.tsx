"use client";
import React, { useState, useEffect } from "react";
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

const EditorPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [boxes, setBoxes] = useState<BoxData[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [layoutName, setLayoutName] = useState<string>("");
  const [layoutDescription, setLayoutDescription] = useState<string | null>(null);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/layouts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const layoutData = response.data;

      const loadedBoxes: BoxData[] = layoutData.boxes.map((box: any) => ({
        id: box.id,
        position: { x: box.positionX, y: box.positionY },
        size: { width: box.width, height: box.height },
        confirmedComponents: box.components.map((comp: any) => ({
          id: comp.id,
          type: comp.type,
          width: comp.width,
          height: comp.height,
          props: comp.props || {},
        })),
        pendingComponents: [],
        isConfirmed: true,
      }));

      setBoxes(loadedBoxes);
      setLayoutName(layoutData.name);
      setLayoutDescription(layoutData.description);
      setLoading(false);
    } catch (error: any) {
      toast.error("加载项目数据失败，请重试");
      router.push("/profile");
    }
  };

  const handleSave = () => {
    form.setFieldsValue({ name: layoutName, description: layoutDescription || "" });
    setIsSaveModalVisible(true);
  };

  const handleSaveConfirm = async (values: { name: string; description: string }) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      const projectData = {
        name: values.name,
        description: values.description || null,
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
              src: comp.file ? undefined : comp.props.src, // 如果有 file，清空 src，依赖后端生成
            },
            fileIndex: comp.file ? index : undefined,
          })),
        })),
      };

      boxes.forEach((box) => {
        [...box.confirmedComponents, ...box.pendingComponents].forEach((comp, index) => {
          if (comp.file) {
            formData.append(`image-${box.id}-${index}`, comp.file);
          }
        });
      });

      formData.append("projectData", JSON.stringify(projectData));

      const response = await axios.put(`/api/layouts/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedLayout = response.data;

      // 更新 boxes 状态
      const newBoxes: BoxData[] = updatedLayout.boxes.map((box: any) => ({
        id: box.id,
        position: { x: box.positionX, y: box.positionY },
        size: { width: box.width, height: box.height },
        confirmedComponents: box.components.map((comp: any) => ({
          id: comp.id,
          type: comp.type,
          width: comp.width,
          height: comp.height,
          props: comp.props, // 使用后端返回的 props
          file: undefined, // 清除 file
        })),
        pendingComponents: [],
        isConfirmed: true,
      }));

      setBoxes(newBoxes);
      toast.success("项目已保存");
      setIsSaveModalVisible(false);
      router.push("/profile");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("保存失败，请重试");
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
          <Workspace
            className="flex-1 bg-white p-8"
            boxes={boxes}
            setBoxes={setBoxes}
            onSelectBox={setSelectedBoxId}
            onSelectComponent={(boxId, index) => {
              setSelectedBoxId(boxId);
              setSelectedComponentIndex(index);
            }}
            isSave={false}
          />
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