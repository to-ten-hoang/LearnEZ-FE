// src/pages/manage/ClassManagement/ClassManagement.tsx
import { useState, useEffect, useCallback } from 'react';
import { Card } from 'antd';
import { filterClassesService } from '../../../services/classManagementService';
import { getTeachersService } from '../../../services/courseManagementService';
import type { Class, FilterClassesRequest } from '../../../types/class';
import type { User } from '../../../types/user';
<<<<<<< HEAD
import ClassFilter from '../../../components/manage/ClassManagement/ClassFilter';
import ClassTable from '../../../components/manage/ClassManagement/ClassTable';
import ClassFormModal from '../../../components/manage/ClassManagement/ClassFormModal';
import CancelClassModal from '../../../components/manage/ClassManagement/CancelClassModal';
import RoomManagementModal from '../../../components/manage/ClassManagement/RoomManagementModal';
=======
import ClassFilter from '../../../components/manage/ClassManagement/ClassFilter/ClassFilter';
import ClassTable from '../../../components/manage/ClassManagement/ClassTable/ClassTable';
import ClassFormModal from '../../../components/manage/ClassManagement/ClassFormModal/ClassFormModal';
import CancelClassModal from '../../../components/manage/ClassManagement/CancelClassModal/CancelClassModal';
import './ClassManagement.css';
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665

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
<<<<<<< HEAD
    const [isRoomModalVisible, setIsRoomModalVisible] = useState(false);
=======
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
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
<<<<<<< HEAD
=======
                // setClasses(response.data);
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
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
<<<<<<< HEAD
=======
            // Lấy danh sách giáo viên để đưa vào bộ lọc và form
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
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
<<<<<<< HEAD
=======
        // Khi lọc, quay về trang 1
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
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
<<<<<<< HEAD
                    onManageRooms={() => setIsRoomModalVisible(true)}
=======
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
                />
            </Card>

            <Card>
<<<<<<< HEAD
=======

>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
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
<<<<<<< HEAD

            <RoomManagementModal
                visible={isRoomModalVisible}
                onClose={() => setIsRoomModalVisible(false)}
            />
=======
>>>>>>> b252bbff32e7fe0f77534d7a4ecfd1ae4fb7b665
        </div>
    );
};

export default ClassManagementPage;