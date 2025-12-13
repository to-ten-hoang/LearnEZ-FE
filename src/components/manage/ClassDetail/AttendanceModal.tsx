import { useState, useEffect, useCallback } from 'react';
import { Modal, Table, Radio, Button, Space, Spin, message, Tag, Empty } from 'antd';
import { SaveOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { OverviewStatistic, EAttendanceStatus, AttendanceRequest, UpdateAttendanceRequest } from '../../../types/attendance';
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_LABELS } from '../../../types/attendance';
import { getDetailStatisticService, createAttendanceService, updateAttendanceService } from '../../../services/attendanceService';
import { getMembersInClassService } from '../../../services/classManagementService';
import type { ClassMember } from '../../../types/class';

interface AttendanceModalProps {
    visible: boolean;
    onClose: () => void;
    schedule: OverviewStatistic | null;
    classId: number;
    onSuccess: () => void;
}

interface StudentAttendance {
    id: number; // ID người dùng trong hệ thống
    memberId: number; // ID bản ghi quan hệ
    name: string;
    email: string;
    phone: string | null;
    selectedStatus: EAttendanceStatus | null;
    attendanceId?: number;
    checkInDate: string | null;
    isChanged: boolean;
}

const AttendanceModal = ({ visible, onClose, schedule, classId, onSuccess }: AttendanceModalProps) => {
    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchStudentDetails = useCallback(async () => {
        if (!schedule) return;

        setLoading(true);
        try {
            // 1. Lấy danh sách tất cả học sinh trong lớp
            const membersResponse = await getMembersInClassService({
                classId: classId,
                searchString: '',
                // status: ['Active'], // Chỉ lấy học sinh đang hoạt động
                size: 100, // Lấy tối đa 100 học sinh
            });

            const allMembers: ClassMember[] = membersResponse.data.content;

            // 2. Lấy danh sách điểm danh đã có (nếu có)
            const attendanceMap = new Map<number, { attendanceId: number; status: EAttendanceStatus; checkIn: string | null }>();

            try {
                const attendanceResponse = await getDetailStatisticService(schedule.scheduleId);
                attendanceResponse.data.content.forEach((record) => {
                    let status: EAttendanceStatus | null = null;
                    if (record.present) status = ATTENDANCE_STATUS.PRESENT;
                    else if (record.absent) status = ATTENDANCE_STATUS.ABSENT;
                    else if (record.late) status = ATTENDANCE_STATUS.LATE;

                    if (status) {
                        attendanceMap.set(record.userId, {
                            attendanceId: record.attendanceId || 0,
                            status: status,
                            checkIn: record.checkInDate,
                        });
                    }
                });
            } catch (error) {
                // Không có dữ liệu điểm danh, bỏ qua lỗi
                console.log('Chưa có dữ liệu điểm danh cho buổi học này');
            }

            // 3. Merge dữ liệu: tất cả học sinh + trạng thái điểm danh (nếu có)
            const mergedStudents: StudentAttendance[] = allMembers.map((member) => {
                const attendanceData = attendanceMap.get(member.id);
                return {
                    id: member.id, // ID người dùng - dùng cho API điểm danh
                    memberId: member.memberId,
                    name: member.name || '',
                    email: member.email || '',
                    phone: member.phone || null,
                    selectedStatus: attendanceData?.status || null,
                    attendanceId: attendanceData?.attendanceId,
                    checkInDate: attendanceData?.checkIn || null,
                    isChanged: false,
                };
            });

            setStudents(mergedStudents);
        } catch (error) {
            console.error('Lỗi lấy danh sách học sinh:', error);
            message.error('Không thể lấy danh sách học sinh');
        } finally {
            setLoading(false);
        }
    }, [schedule, classId]);

    useEffect(() => {
        if (visible && schedule) {
            fetchStudentDetails();
        }
    }, [visible, schedule, fetchStudentDetails]);

    const handleStatusChange = (studentId: number, status: EAttendanceStatus) => {
        setStudents((prev) =>
            prev.map((student) =>
                student.id === studentId
                    ? { ...student, selectedStatus: status, isChanged: true }
                    : student
            )
        );
    };

    const handleMarkAllPresent = () => {
        setStudents((prev) =>
            prev.map((student) => ({
                ...student,
                selectedStatus: ATTENDANCE_STATUS.PRESENT,
                isChanged: true,
            }))
        );
    };

    const handleSave = async () => {
        if (!schedule) return;

        const changedStudents = students.filter((s) => s.isChanged && s.selectedStatus !== null);
        if (changedStudents.length === 0) {
            message.warning('Chưa có thay đổi nào để lưu.');
            return;
        }

        setSaving(true);
        try {
            const toCreate: AttendanceRequest[] = [];
            const toUpdate: UpdateAttendanceRequest[] = [];

            changedStudents.forEach((student) => {
                if (student.attendanceId && student.attendanceId > 0) {
                    toUpdate.push({
                        attendanceId: student.attendanceId,
                        attendanceStatus: student.selectedStatus!,
                    });
                } else {
                    toCreate.push({
                        classId: classId,
                        // Backend tự động tìm scheduleId khả dụng, nhưng vẫn gửi để tham khảo
                        scheduleId: schedule.scheduleId,
                        studentId: student.id,
                        attendanceStatus: student.selectedStatus!,
                        checkIn: new Date().toISOString(), // Thêm thời gian check-in hiện tại
                    });
                }
            });

            if (toCreate.length > 0) {
                await createAttendanceService(toCreate);
            }
            if (toUpdate.length > 0) {
                await updateAttendanceService(toUpdate);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Lỗi lưu điểm danh:', error);
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            title: '#',
            key: 'index',
            width: 50,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Họ và tên',
            key: 'name',
            render: (_: any, record: StudentAttendance) => (
                <Space>
                    <UserOutlined />
                    <span style={{ fontWeight: 500 }}>{record.name}</span>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
        },
        {
            title: 'Trạng thái điểm danh',
            key: 'status',
            width: 300,
            render: (_: any, record: StudentAttendance) => (
                <Radio.Group
                    value={record.selectedStatus}
                    onChange={(e) => handleStatusChange(record.id, e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                    size="small"
                >
                    <Radio.Button
                        value={ATTENDANCE_STATUS.PRESENT}
                        style={{
                            backgroundColor: record.selectedStatus === ATTENDANCE_STATUS.PRESENT ? '#52c41a' : undefined,
                            borderColor: record.selectedStatus === ATTENDANCE_STATUS.PRESENT ? '#52c41a' : undefined,
                            color: record.selectedStatus === ATTENDANCE_STATUS.PRESENT ? '#fff' : undefined,
                        }}
                    >
                        {ATTENDANCE_STATUS_LABELS[ATTENDANCE_STATUS.PRESENT]}
                    </Radio.Button>
                    <Radio.Button
                        value={ATTENDANCE_STATUS.ABSENT}
                        style={{
                            backgroundColor: record.selectedStatus === ATTENDANCE_STATUS.ABSENT ? '#ff4d4f' : undefined,
                            borderColor: record.selectedStatus === ATTENDANCE_STATUS.ABSENT ? '#ff4d4f' : undefined,
                            color: record.selectedStatus === ATTENDANCE_STATUS.ABSENT ? '#fff' : undefined,
                        }}
                    >
                        {ATTENDANCE_STATUS_LABELS[ATTENDANCE_STATUS.ABSENT]}
                    </Radio.Button>
                    <Radio.Button
                        value={ATTENDANCE_STATUS.LATE}
                        style={{
                            backgroundColor: record.selectedStatus === ATTENDANCE_STATUS.LATE ? '#faad14' : undefined,
                            borderColor: record.selectedStatus === ATTENDANCE_STATUS.LATE ? '#faad14' : undefined,
                            color: record.selectedStatus === ATTENDANCE_STATUS.LATE ? '#fff' : undefined,
                        }}
                    >
                        {ATTENDANCE_STATUS_LABELS[ATTENDANCE_STATUS.LATE]}
                    </Radio.Button>
                </Radio.Group>
            ),
        },
        {
            title: 'Check-in',
            key: 'checkIn',
            width: 100,
            render: (_: any, record: StudentAttendance) => (
                record.checkInDate ? (
                    <Tag color="blue">{dayjs(record.checkInDate).format('HH:mm')}</Tag>
                ) : (
                    <Tag color="default">--</Tag>
                )
            ),
        },
    ];

    const hasChanges = students.some((s) => s.isChanged);
    const markedCount = students.filter((s) => s.selectedStatus !== null).length;

    return (
        <Modal
            title={
                <Space>
                    <span>📋 Điểm danh</span>
                    {schedule && (
                        <Tag color="blue">
                            {schedule.title} - {dayjs(schedule.startAt).format('DD/MM/YYYY')}
                        </Tag>
                    )}
                </Space>
            }
            open={visible}
            onCancel={onClose}
            width={950}
            footer={null}
            className="attendance-modal"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                <Space>
                    <Tag>Tổng: {students.length} học sinh</Tag>
                    <Tag color="green">Đã điểm danh: {markedCount}</Tag>
                    <Tag color="orange">Chưa điểm danh: {students.length - markedCount}</Tag>
                </Space>
                <Space>
                    <Button icon={<CheckCircleOutlined />} onClick={handleMarkAllPresent}>
                        Đánh dấu tất cả có mặt
                    </Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSave}
                        loading={saving}
                        disabled={!hasChanges}
                    >
                        Lưu điểm danh
                    </Button>
                </Space>
            </div>

            <Spin spinning={loading}>
                {students.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={students}
                        rowKey="id"
                        pagination={false}
                        size="middle"
                        scroll={{ y: 400 }}
                    />
                ) : (
                    <Empty
                        description="Chưa có học sinh nào trong lớp"
                        style={{ padding: '40px 0' }}
                    />
                )}
            </Spin>
        </Modal>
    );
};

export default AttendanceModal;
