import React, { useState } from "react";
import { Form, DatePicker, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";

const TestForm = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  
  const handleFileChange = ({ fileList }) => setFileList(fileList);

  const validateFile = (file) => {
    const isJPGorPNG = file.type === "image/jpeg" || file.type === "image/png";
    const isSizeValid = file.size / 1024 / 1024 < 1; // less than 1MB
    if (!isJPGorPNG) {
      message.error("You can only upload JPG/PNG file!");
    }
    if (!isSizeValid) {
      message.error("File size must be smaller than 1MB!");
    }
    return isJPGorPNG && isSizeValid;
  };

  const onFinish = async (values) => {
    // Construct form data to send to the server
    const formData = new FormData();
    formData.append("startDate", values.startDate.format("YYYY-MM-DD"));
    formData.append("endDate", values.endDate.format("YYYY-MM-DD"));
    
    if (fileList.length > 0) {
      formData.append("image", fileList[0].originFileObj);
    }

    try {
      const response = await axios.post("http://localhost:5000/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Data submitted successfully!");
      form.resetFields();
    } catch (error) {
      message.error("Failed to submit data!");
    }
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item label="Start Date" name="startDate" rules={[{ required: true, message: "Please select the start date!" }]}>
        <DatePicker />
      </Form.Item>

      <Form.Item label="End Date" name="endDate" rules={[{ required: true, message: "Please select the end date!" }]}>
        <DatePicker />
      </Form.Item>

      <Form.Item label="Upload Image" valuePropName="fileList" getValueFromEvent={(e) => e && e.fileList} rules={[{ required: true, message: "Please upload an image!" }]}>
        <Upload
          listType="picture"
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={validateFile}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TestForm;
