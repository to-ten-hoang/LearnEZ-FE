// pages/Orders/Orders.tsx - Updated with Server-side Search & Pagination
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Card,
    Typography,
    Empty,
    Tabs,
    Row,
    Col,
    Statistic,
    Select,
    Input,
    Button,
    DatePicker,
    Pagination,
} from 'antd';
import {
    ShoppingOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    ReloadOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Dayjs } from 'dayjs';
import useOrderStore from '../../../store/orderStore';
import OrderCard from '../../../components/student/Order/OrderCard/OrderCard';
import type { Order, SearchOrderDto } from '../../../types/order';
import './Orders.css';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Helper function to map tab key to backend status (Title Case)
const TAB_TO_STATUS: Record<string, string> = {
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    failed: 'Failed',
};

const OrdersPage: React.FC = () => {
    const navigate = useNavigate();

    // ✅ ZUSTAND STATE (includes pagination now)
    const { orders, isLoading, refreshOrders, pagination } = useOrderStore();

    // ✅ COMPUTED VALUES (using useMemo for reactivity)
    const pendingOrdersCount = useMemo(
        () => orders.filter((order) => order.status === 'Pending').length,
        [orders]
    );

    const completedOrdersCount = useMemo(
        () => orders.filter((order) => order.status === 'Completed').length,
        [orders]
    );

    const totalSpent = useMemo(
        () =>
            orders
                .filter((order) => order.status === 'Completed')
                .reduce((total, order) => {
                    return total + (order.totalAmount || order.detail.priceAtPurchase);
                }, 0),
        [orders]
    );

    // ✅ LOCAL STATE for filtering
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState<string>('createdAt,desc');
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [refreshing, setRefreshing] = useState(false);

    // ✅ DEBOUNCE SEARCH (500ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ✅ BUILD SEARCH DTO from filters (server-side only: search, date)
    // NOTE: Tab filtering is done locally for better UX
    const buildSearchDto = useCallback((): SearchOrderDto => {
        const dto: SearchOrderDto = {};

        if (debouncedSearch.trim()) {
            dto.searchString = debouncedSearch.trim();
        }

        // ❌ REMOVED: Tab filtering is now local for instant switching
        // if (activeTab !== 'all') {
        //     dto.statusOrder = [TAB_TO_STATUS[activeTab] as StatusOrderFilter];
        // }

        if (dateRange) {
            dto.fromDate = dateRange[0].format('YYYY-MM-DD');
            dto.toDate = dateRange[1].format('YYYY-MM-DD');
        }

        return dto;
    }, [debouncedSearch, dateRange]);

    // ✅ LOCAL FILTERING by tab (instant UX)
    const getFilteredOrders = useMemo((): Order[] => {
        if (activeTab === 'all') {
            return orders;
        }
        return orders.filter((order) => order.status === TAB_TO_STATUS[activeTab]);
    }, [orders, activeTab]);

    // ✅ FETCH ORDERS when server-side filters change (NOT tab)
    useEffect(() => {
        const searchDto = buildSearchDto();
        refreshOrders(searchDto, currentPage, pageSize, sortBy);
    }, [debouncedSearch, dateRange, currentPage, pageSize, sortBy, buildSearchDto, refreshOrders]);

    // ✅ Reset page when server-side filters change
    useEffect(() => {
        setCurrentPage(0);
    }, [debouncedSearch, dateRange, sortBy]);

    // ✅ Listen for focus event to refresh when user returns to tab
    useEffect(() => {
        const handleFocus = () => {
            console.log('Window focused, refreshing orders...');
            const searchDto = buildSearchDto();
            refreshOrders(searchDto, currentPage, pageSize, sortBy);
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('Tab became visible, refreshing orders...');
                const searchDto = buildSearchDto();
                refreshOrders(searchDto, currentPage, pageSize, sortBy);
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [buildSearchDto, currentPage, pageSize, sortBy, refreshOrders]);

    // ✅ FORMAT PRICE HELPER
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    // ✅ EVENT HANDLERS
    const handleTabChange = (key: string) => {
        setActiveTab(key);
    };

    const handleContinueShopping = () => {
        navigate('/courses');
    };

    // ✅ MANUAL REFRESH HANDLER
    const handleManualRefresh = async () => {
        setRefreshing(true);
        try {
            const searchDto = buildSearchDto();
            await refreshOrders(searchDto, currentPage, pageSize, sortBy);
        } finally {
            setRefreshing(false);
        }
    };

    // ✅ PAGINATION HANDLERS
    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page - 1); // Ant Design uses 1-indexed, API uses 0-indexed
        if (size && size !== pageSize) {
            setPageSize(size);
        }
    };

    // ✅ DATE RANGE HANDLER
    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0], dates[1]]);
        } else {
            setDateRange(null);
        }
    };

    // ✅ CLEAR ALL FILTERS
    const handleClearFilters = () => {
        setSearchQuery('');
        setDebouncedSearch('');
        setActiveTab('all');
        setDateRange(null);
        setSortBy('createdAt,desc');
        setCurrentPage(0);
    };

    // ✅ RENDER FILTERS & CONTROLS
    const renderFiltersAndControls = () => (
        <Card className="order-controls" style={{ marginBottom: 24 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        flex: 1,
                        flexWrap: 'wrap',
                    }}
                >
                    <Input
                        placeholder="Tìm kiếm theo tên khóa học..."
                        prefix={<SearchOutlined />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                    />

                    <RangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        format="DD/MM/YYYY"
                        placeholder={['Từ ngày', 'Đến ngày']}
                        style={{ width: 250 }}
                        suffixIcon={<CalendarOutlined />}
                    />

                    <Select
                        value={sortBy}
                        onChange={setSortBy}
                        style={{ width: 150 }}
                        placeholder="Sắp xếp theo"
                    >
                        <Option value="createdAt,desc">Mới nhất</Option>
                        <Option value="createdAt,asc">Cũ nhất</Option>
                    </Select>

                    {(searchQuery || dateRange || activeTab !== 'all') && (
                        <Button size="small" onClick={handleClearFilters}>
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleManualRefresh}
                        loading={refreshing}
                        title="Làm mới danh sách đơn hàng"
                    >
                        Làm mới
                    </Button>
                </div>
            </div>
        </Card>
    );

    // ✅ RENDER ORDER STATISTICS
    const renderOrderStatistics = () => (
        <Card className="order-statistics" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
                <Col xs={12} sm={6}>
                    <Statistic
                        title="Tổng đơn hàng"
                        value={orders.length}
                        prefix={<ShoppingOutlined />}
                    />
                </Col>
                <Col xs={12} sm={6}>
                    <Statistic
                        title="Đang chờ"
                        value={pendingOrdersCount}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: '#faad14' }}
                    />
                </Col>
                <Col xs={12} sm={6}>
                    <Statistic
                        title="Hoàn thành"
                        value={completedOrdersCount}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Col>
                <Col xs={12} sm={6}>
                    <Statistic
                        title="Tổng chi tiêu"
                        value={formatPrice(totalSpent)}
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Col>
            </Row>
        </Card>
    );

    // ✅ RENDER ORDER LIST
    const renderOrderList = (orderList: Order[]) => {
        if (orderList.length === 0) {
            const emptyMessage =
                activeTab === 'all'
                    ? 'Bạn chưa có đơn hàng nào'
                    : `Không có đơn hàng ${
                          activeTab === 'pending'
                              ? 'đang chờ'
                              : activeTab === 'completed'
                                ? 'hoàn thành'
                                : 'bị hủy'
                      }`;

            return (
                <Card className="empty-orders">
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyMessage}>
                        <Button type="primary" onClick={handleContinueShopping}>
                            Mua khóa học ngay
                        </Button>
                    </Empty>
                </Card>
            );
        }

        return (
            <>
                <div className="order-list">
                    <Row gutter={[16, 16]}>
                        {orderList.map((order) => (
                            <Col key={order.id} xs={24} sm={24} md={12} lg={8}>
                                <OrderCard order={order} />
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* ✅ PAGINATION */}
                {pagination.totalElements > 0 && (
                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                        <Pagination
                            current={currentPage + 1}
                            pageSize={pageSize}
                            total={pagination.totalElements}
                            onChange={handlePageChange}
                            showSizeChanger
                            showTotal={(total, range) =>
                                `${range[0]}-${range[1]} / ${total} đơn hàng`
                            }
                            pageSizeOptions={['5', '10', '20', '50']}
                        />
                    </div>
                )}
            </>
        );
    };

    // ✅ LOADING STATE
    if (isLoading && orders.length === 0) {
        return (
            <div className="orders-page">
                <Card className="loading-container">
                    <div className="loading-content">
                        <span className="loading-spinner" />
                        <Title level={4}>Đang tải đơn hàng...</Title>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="orders-header-actions">
                <h1>Lịch sử đơn hàng</h1>
                <div className="header-actions">
                    <Button onClick={handleContinueShopping} icon={<ShoppingOutlined />}>
                        Tiếp tục mua sắm
                    </Button>
                </div>
            </div>

            {/* ✅ ORDER STATISTICS */}
            {renderOrderStatistics()}

            {/* ✅ FILTERS & CONTROLS */}
            {renderFiltersAndControls()}

            {/* ✅ ORDER TABS */}
            <Card className="orders-content">
                <Tabs activeKey={activeTab} onChange={handleTabChange} className="order-tabs">
                    <TabPane
                        tab={
                            <span>
                                <ShoppingOutlined />
                                &nbsp; Tất cả ({orders.length})
                            </span>
                        }
                        key="all"
                    />
                    <TabPane
                        tab={
                            <span>
                                <ClockCircleOutlined />
                                &nbsp; Đang chờ ({pendingOrdersCount})
                            </span>
                        }
                        key="pending"
                    />
                    <TabPane
                        tab={
                            <span>
                                <CheckCircleOutlined />
                                &nbsp; Hoàn thành ({completedOrdersCount})
                            </span>
                        }
                        key="completed"
                    />
                    <TabPane
                        tab={
                            <span>
                                <CloseCircleOutlined />
                                &nbsp; Đã hủy
                            </span>
                        }
                        key="cancelled"
                    />
                </Tabs>

                {/* ✅ ORDER LIST - uses local filtered orders */}
                {renderOrderList(getFilteredOrders)}
            </Card>
        </div>
    );
};

export default OrdersPage;
