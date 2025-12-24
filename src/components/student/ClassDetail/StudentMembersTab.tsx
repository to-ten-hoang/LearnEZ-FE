import { useState, useEffect } from 'react';
import { Avatar, Input, Spin, Empty, Pagination } from 'antd';
import { UserOutlined, SearchOutlined, PhoneOutlined } from '@ant-design/icons';
import { getMembersInClass } from '../../../api/classApi';
import type { ClassMember } from '../../../types/class';

interface Props {
    classId: number;
}

const StudentMembersTab = ({ classId }: Props) => {
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<ClassMember[]>([]);
    const [searchString, setSearchString] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await getMembersInClass({
                classId,
                searchString: searchString || undefined,
                page: pagination.current - 1,
                size: pagination.pageSize,
            });

            if (response.data) {
                setMembers(response.data.content);
                setPagination((prev) => ({
                    ...prev,
                    total: response.data.totalElements,
                }));
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId, pagination.current]);

    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, current: 1 }));
        fetchMembers();
    };

    return (
        <div className="tab-content">
            <div className="tab-filter-bar">
                <Input
                    placeholder="Tìm kiếm thành viên..."
                    prefix={<SearchOutlined />}
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ maxWidth: 300 }}
                    allowClear
                />
            </div>

            <Spin spinning={loading}>
                {members.length > 0 ? (
                    <>
                        <div className="members-list">
                            {members.map((member) => (
                                <div key={member.id} className="member-card">
                                    <Avatar
                                        size={48}
                                        icon={<UserOutlined />}
                                    />
                                    <div className="member-info">
                                        <div className="member-name">{member.name}</div>
                                        <div className="member-contact">
                                            {member.phone && (
                                                <span>
                                                    <PhoneOutlined /> {member.phone}
                                                </span>
                                            )}
                                            {member.email && <span> • {member.email}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 20, textAlign: 'center' }}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={(page) => setPagination((prev) => ({ ...prev, current: page }))}
                                showTotal={(total) => `Tổng ${total} thành viên`}
                            />
                        </div>
                    </>
                ) : (
                    <Empty description="Không có thành viên nào" />
                )}
            </Spin>
        </div>
    );
};

export default StudentMembersTab;
