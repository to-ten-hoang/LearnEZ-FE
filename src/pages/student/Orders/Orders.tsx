// pages/Orders/Orders.tsx - Updated with Auto-refresh
import React, { useEffect, useState } from "react";
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
} from "antd";
import {
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
// import moment from 'moment';
import useOrderStore from "../../../store/orderStore";
import OrderCard from "../../../components/student/Order/OrderCard/OrderCard";
import type { Order } from "../../../types/order";
import "./Orders.css";

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();

  // ✅ ZUSTAND STATE
  const {
    orders,
    pendingOrdersCount,
    completedOrdersCount,
    totalSpent,
    isLoading,
    refreshOrders,
  } = useOrderStore();

  // ✅ LOCAL STATE cho filtering
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt_desc");
  const [refreshing, setRefreshing] = useState(false);

  // ✅ LOAD DATA khi component mount và auto-refresh
  useEffect(() => {
    refreshOrders();

    // ✅ Auto refresh mỗi 30s để cập nhật order status từ server
    const interval = setInterval(() => {
      console.log("Auto-refreshing orders...");
      refreshOrders();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshOrders]);

  // ✅ Listen for focus event để refresh khi user quay lại tab
  useEffect(() => {
    const handleFocus = () => {
      console.log("Window focused, refreshing orders...");
      refreshOrders();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Tab became visible, refreshing orders...");
        refreshOrders();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshOrders]);

  // ✅ FORMAT PRICE HELPER
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // ✅ GET FILTERED ORDERS
  const getFilteredOrders = (): Order[] => {
    let filtered = orders;

    // Filter by tab (status)
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (order) => order.status === activeTab.toUpperCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (order) =>
          order.detail.course.title.toLowerCase().includes(query) ||
          order.detail.course.authorName?.toLowerCase().includes(query) ||
          order.id.toString().includes(query)
      );
    }

    // Sort orders
    const [field, direction] = sortBy.split("_");
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (field) {
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "price":
          aValue = a.detail.priceAtPurchase;
          bValue = b.detail.priceAtPurchase;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (field === "status") {
        return direction === "desc"
          ? String(bValue).localeCompare(String(aValue))
          : String(aValue).localeCompare(String(bValue));
      }
      return direction === "desc"
        ? Number(bValue) - Number(aValue)
        : Number(aValue) - Number(bValue);
    });

    return filtered;
  };

  // ✅ EVENT HANDLERS
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleContinueShopping = () => {
    navigate("/courses");
  };

  // ✅ MANUAL REFRESH HANDLER
  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshOrders();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredOrders = getFilteredOrders();

  // ✅ RENDER FILTERS & CONTROLS
  const renderFiltersAndControls = () => (
    <Card className="order-controls" style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            flex: 1,
            minWidth: 300,
          }}
        >
          <Input
            placeholder="Tìm kiếm theo tên khóa học, tác giả hoặc mã đơn hàng..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, maxWidth: 300 }}
            allowClear
          />

          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 180 }}
            placeholder="Sắp xếp theo"
          >
            <Option value="createdAt_desc">Mới nhất</Option>
            <Option value="createdAt_asc">Cũ nhất</Option>
            <Option value="price_desc">Giá cao nhất</Option>
            <Option value="price_asc">Giá thấp nhất</Option>
            <Option value="status_asc">Trạng thái A-Z</Option>
          </Select>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleManualRefresh}
            loading={refreshing}
            title="Làm mới danh sách đơn hàng"
          >
            Làm mới
          </Button>

          {/* ✅ Auto-refresh indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "#52c41a",
              fontSize: 12,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#52c41a",
                animation: "pulse 2s infinite",
              }}
            />
            Tự động cập nhật
          </div>
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
            valueStyle={{ color: "#faad14" }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="Hoàn thành"
            value={completedOrdersCount}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="Tổng chi tiêu"
            value={formatPrice(totalSpent)}
            valueStyle={{ color: "#1890ff" }}
          />
        </Col>
      </Row>
    </Card>
  );

  // ✅ RENDER ORDER LIST
  const renderOrderList = (orderList: Order[]) => {
    if (orderList.length === 0) {
      const emptyMessage =
        activeTab === "all"
          ? "Bạn chưa có đơn hàng nào"
          : `Không có đơn hàng ${
              activeTab === "pending"
                ? "đang chờ"
                : activeTab === "completed"
                ? "hoàn thành"
                : "bị hủy"
            }`;

      return (
        <Card className="empty-orders">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={emptyMessage}
          >
            <Button type="primary" onClick={handleContinueShopping}>
              Mua khóa học ngay
            </Button>
          </Empty>
        </Card>
      );
    }

    return (
      <div className="order-list">
        <Row gutter={[16, 16]}>
          {orderList.map((order) => (
            <Col key={order.id} xs={24} sm={24} md={12} lg={8}>
              <OrderCard order={order} />
            </Col>
          ))}
        </Row>
      </div>
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
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          className="order-tabs"
        >
          <TabPane
            tab={
              <span>
                <ShoppingOutlined />
                &nbsp; Tất cả ({orders.length})
              </span>
            }
            key="all"
          >
            {renderOrderList(filteredOrders)}
          </TabPane>

          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                &nbsp; Đang chờ ({pendingOrdersCount})
              </span>
            }
            key="pending"
          >
            {renderOrderList(filteredOrders)}
          </TabPane>

          <TabPane
            tab={
              <span>
                <CheckCircleOutlined />
                &nbsp; Hoàn thành ({completedOrdersCount})
              </span>
            }
            key="completed"
          >
            {renderOrderList(filteredOrders)}
          </TabPane>

          <TabPane
            tab={
              <span>
                <CloseCircleOutlined />
                &nbsp; Đã hủy
              </span>
            }
            key="cancelled"
          >
            {renderOrderList(filteredOrders)}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default OrdersPage;
