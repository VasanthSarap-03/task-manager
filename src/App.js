import React, { useState } from "react";
import {
  Calendar,
  Modal,
  Typography,
  Form,
  Input,
  Select,
  Button,
  Tag,
  List,
  Space,
  Popconfirm,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { addTask, deleteTask, editTask } from "./redux/taskSlice";
import { Formik } from "formik";
import * as Yup from "yup";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import dayjs from "dayjs";
import "antd/dist/reset.css";
import "./App.css";

const { Title } = Typography;
const { Option } = Select;

const TaskSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  category: Yup.string().required("Category is required"),
});

const categoryColors = {
  success: "#52c41a",
  warning: "#faad14",
  issue: "#f5222d",
  info: "#1890ff",
};

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [initialValues, setInitialValues] = useState({
    title: "",
    description: "",
    category: "",
  });

  // Chart filter state
  const [chartFilter, setChartFilter] = useState(null);
  const [tempFilter, setTempFilter] = useState(null);

  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks);

  const dateKey = selectedDate?.format("YYYY-MM-DD");
  const tasksForDate = dateKey ? tasks[dateKey] || [] : [];

  const onSelectDate = (value) => {
    setSelectedDate(value);
    setInitialValues({ title: "", description: "", category: "" });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSubmit = (values, { resetForm }) => {
    const formattedDate = selectedDate.format("YYYY-MM-DD");

    if (isEditing) {
      dispatch(
        editTask({
          date: formattedDate,
          index: editIndex,
          updatedTask: { ...values, date: formattedDate },
        })
      );
    } else {
      dispatch(
        addTask({
          date: formattedDate,
          task: { ...values, date: formattedDate },
        })
      );
    }

    resetForm();
    setIsModalOpen(false);
    setIsEditing(false);
    setEditIndex(null);
  };

  const onDelete = (taskIndex) => {
    dispatch(deleteTask({ date: dateKey, index: taskIndex }));
  };

  const onEdit = (task, index) => {
    setInitialValues({
      title: task.title,
      description: task.description,
      category: task.category,
    });
    setEditIndex(index);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Aggregate chart data
  const allTasks = Object.values(tasks).flat();
  const filteredTasks = chartFilter
    ? allTasks.filter((task) => task.category === chartFilter)
    : allTasks;

  const chartData = filteredTasks.reduce((acc, task) => {
    const existing = acc.find((item) => item.name === task.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: task.category, value: 1 });
    }
    return acc;
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>📅 Task Manager</Title>

      <Calendar fullscreen={false} onSelect={onSelectDate} />

      {/* Chart Filter */}
      <div style={{ marginTop: 40 }}>
        <Title level={4}>📊 Task Category Overview</Title>

        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Filter by Category"
            allowClear
            style={{ width: 200 }}
            value={tempFilter}
            onChange={(value) => setTempFilter(value)}
          >
            <Option value="success">✅ Success</Option>
            <Option value="warning">⚠️ Warning</Option>
            <Option value="issue">❌ Issue</Option>
            <Option value="info">ℹ️ Info</Option>
          </Select>
          <Button type="primary" onClick={() => setChartFilter(tempFilter)}>
            Apply
          </Button>
          <Button onClick={() => {
            setChartFilter(null);
            setTempFilter(null);
          }}>
            Reset
          </Button>
        </Space>

        {chartData.length > 0 ? (
          <PieChart width={400} height={300}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={categoryColors[entry.name]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : (
          <p>No tasks to display.</p>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        title={`${isEditing ? "Edit" : "Add"} Task for ${
          selectedDate ? dayjs(selectedDate).format("DD MMM YYYY") : ""
        }`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={TaskSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="Title"
                validateStatus={errors.title && touched.title ? "error" : ""}
                help={touched.title && errors.title}
              >
                <Input
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Form.Item>

              <Form.Item label="Description">
                <Input.TextArea
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Form.Item>

              <Form.Item
                label="Category"
                validateStatus={
                  errors.category && touched.category ? "error" : ""
                }
                help={touched.category && errors.category}
              >
                <Select
                  name="category"
                  value={values.category}
                  onChange={(value) => setFieldValue("category", value)}
                  onBlur={handleBlur}
                >
                  <Option value="success">✅ Success</Option>
                  <Option value="warning">⚠️ Warning</Option>
                  <Option value="issue">❌ Issue</Option>
                  <Option value="info">ℹ️ Info</Option>
                </Select>
              </Form.Item>

              <Button type="primary" htmlType="submit" block>
                {isEditing ? "Update Task" : "Add Task"}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Task List */}
      {tasksForDate.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Title level={5}>Tasks for this day:</Title>
          <List
            itemLayout="horizontal"
            dataSource={tasksForDate}
            renderItem={(task, index) => (
              <List.Item
                actions={[
                  <Button type="link" onClick={() => onEdit(task, index)}>
                    Edit
                  </Button>,
                  <Popconfirm
                    title="Are you sure to delete this task?"
                    onConfirm={() => onDelete(index)}
                  >
                    <Button type="link" danger>
                      Delete
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={categoryColors[task.category]}>
                        {task.category}
                      </Tag>
                      {task.title}
                    </Space>
                  }
                  description={task.description}
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
}

export default App;
