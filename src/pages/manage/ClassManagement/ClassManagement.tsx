// src/pages/manage/ClassManagement/ClassManagement.tsx
import { useState, useEffect, useCallback } from 'react';
import { Card } from 'antd';
import { filterClassesService } from '../../../services/classManagementService';
import { getTeachersService } from '../../../services/courseManagementService';
import type { Class, FilterClassesRequest } from '../../../types/class';
import type { User } from '../../../types/user';
import ClassFilter from '../../../components/manage/ClassManagement/ClassFilter';
import ClassTable from '../../../components/manage/ClassManagement/ClassTable';
import ClassFormModal from '../../../components/manage/ClassManagement/ClassFormModal';
import CancelClassModal from '../../../components/manage/ClassManagement/CancelClassModal';
import RoomManagementModal from '../../../components/manage/ClassManagement/RoomManagementModal';

const ClassManagementPage = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<FilterClassesRequest>({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [isRoomModalVisible, setIsRoomModalVisible] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);

    const fetchClasses = useCallback(
        async (currentFilters: FilterClassesRequest, page: number, size: number) => {
            setLoading(true);
            try {
                const response = await filterClassesService({
                    ...currentFilters,
                    page: page - 1,
                    size: size,
                });
                setClasses(response.data.content);
                setPagination((prev) => ({
                    ...prev,
                    total: response.data.totalElements,
                    current: page,
                    pageSize: size,
                }));
            } catch (error) {
                console.error('Failed to fetch classes:', error);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const fetchInitialData = useCallback(async () => {
        try {
            const teacherList = await getTeachersService();
            setTeachers(teacherList);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        fetchClasses(filters, pagination.current, pagination.pageSize);
    }, [filters, fetchClasses]);

    const handleFilter = (newFilters: Partial<FilterClassesRequest>) => {
        setFilters(newFilters);
        setPagination((prev) => ({ ...prev, current: 1 }));
        fetchClasses(newFilters, 1, pagination.pageSize);
    };

    const handleTableChange = (newPagination: any) => {
        fetchClasses(filters, newPagination.current, newPagination.pageSize);
    };

    const handleOpenFormModal = (cls: Class | null) => {
        setSelectedClass(cls);
        setIsFormModalVisible(true);
    };

    const handleCloseFormModal = (shouldRefresh: boolean) => {
        setIsFormModalVisible(false);
        if (shouldRefresh) {
            fetchClasses(filters, pagination.current, pagination.pageSize);
        }
    };

    const handleOpenCancelModal = (cls: Class) => {
        setSelectedClass(cls);
        setIsCancelModalVisible(true);
    };

    const handleCloseCancelModal = (shouldRefresh: boolean) => {
        setIsCancelModalVisible(false);
        if (shouldRefresh) {
            fetchClasses(filters, pagination.current, pagination.pageSize);
        }
    };

    return (
        <div className="class-management-container">
            <h2>Quản Lý Lớp Học</h2>
            <Card style={{ marginBottom: 5 }}>
                <ClassFilter
                    onFilter={handleFilter}
                    teachers={teachers}
                    loading={loading}
                    createClassService={() => handleOpenFormModal(null)}
                    onManageRooms={() => setIsRoomModalVisible(true)}
                />
            </Card>

            <Card>
                <ClassTable
                    data={classes}
                    loading={loading}
                    pagination={pagination}
                    onTableChange={handleTableChange}
                    onEdit={handleOpenFormModal}
                    onCancel={handleOpenCancelModal}
                />
            </Card>

            <ClassFormModal
                visible={isFormModalVisible}
                initialData={selectedClass}
                onClose={handleCloseFormModal}
                teachers={teachers}
            />

            <CancelClassModal
                visible={isCancelModalVisible}
                classData={selectedClass}
                onClose={handleCloseCancelModal}
            />

            <RoomManagementModal
                visible={isRoomModalVisible}
                onClose={() => setIsRoomModalVisible(false)}
            />
        </div>
    );
};

export default ClassManagementPage;