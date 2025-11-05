// src/components/manage/ClassDetail/ClassInfoTab.tsx
import { Card, Descriptions } from 'antd';
import moment from 'moment';
import type { Class } from '../../../types/class';

interface ClassInfoTabProps {
    classData: Class;
}

const ClassInfoTab = ({ classData }: ClassInfoTabProps) => {
    return (
        <Card>
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Tên lớp học">{classData.name}</Descriptions.Item>
                <Descriptions.Item label="Tiêu đề">{classData.title}</Descriptions.Item>
                <Descriptions.Item label="Giáo viên">{`${classData.teacher.firstName} ${classData.teacher.lastName}`}</Descriptions.Item>
                {/* <Descriptions.Item label="Trạng thái">{classData.status}</Descriptions.Item> */}
                <Descriptions.Item label="Ngày tạo">
                    {moment(classData.createdAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                    {classData.description || 'Không có mô tả'}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

export default ClassInfoTab;
