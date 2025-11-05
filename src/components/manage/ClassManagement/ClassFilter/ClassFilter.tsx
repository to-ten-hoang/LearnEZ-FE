// src/components/manage/ClassManagement/ClassFilter/ClassFilter.tsx
import { Form, Input, Select, DatePicker, Button, Row, Col } from 'antd';
import type { User } from '../../../../types/user';
import { PlusOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ClassFilterProps {
    onFilter: (values: any) => void;
    createClassService: (data: any) => void;
    teachers: User[];
    loading: boolean;
}

const ClassFilter = ({ onFilter, teachers, loading, createClassService }: ClassFilterProps) => {
    const [form] = Form.useForm();

    const handleFinish = (values: any) => {
        const filters = {
            ...values,
            fromDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
            toDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
            dateRange: undefined,
        };
        onFilter(filters);
    };

    const handleReset = () => {
        form.resetFields();
        onFilter({});
    };

    return (
        <Form form={form} layout="inline" onFinish={handleFinish} className="class-filter-form">
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="searchString" label="Tìm kiếm">
                        <Input placeholder="Nhập tên, tiêu đề lớp học..." allowClear />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="idTeacher" label="Giáo viên">
                        <Select placeholder="Chọn giáo viên" allowClear>
                            {teachers.map((teacher) => (
                                <Option key={teacher.id} value={teacher.id}>
                                    {`${teacher.firstName} ${teacher.lastName}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                {/* <Col span={8}>
                    <Form.Item name="statusClass" label="Trạng thái">
                        <Select mode="multiple" placeholder="Chọn trạng thái" allowClear>
                            {CLASS_STATUSES.map((status) => (
                                <Option key={status} value={status}>
                                    {status}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col> */}
                <Col span={8}>
                    <Form.Item name="dateRange" label="Ngày tạo">
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col
                    span={16}
                    style={{
                        textAlign: 'right',
                        alignSelf: 'flex-end',
                        marginLeft: 'auto',
                        marginTop: 16,
                    }}
                >
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={createClassService}
                        style={{ marginRight: 8 }}
                    >
                        Thêm lớp học mới
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        style={{ marginRight: 8 }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button onClick={handleReset} disabled={loading}>
                        Xóa bộ lọc
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default ClassFilter;
