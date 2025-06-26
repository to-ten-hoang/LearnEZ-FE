import React from 'react';
import { Typography, Divider, List } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const relatedPosts = [
  { id: '1', title: 'Các mẹo thi TOEIC hiệu quả' },
  { id: '2', title: 'Cách chuẩn bị tốt cho TOEIC' },
  { id: '3', title: 'Lịch thi TOEIC năm 2025' },
  { id: '4', title: 'Những câu hỏi thường gặp về TOEIC' },
];

const BlogDetail: React.FC = () => {
  const navigate = useNavigate();

  const onClickRelatedPost = (id: string) => {
    navigate(`/blog/${id}`);
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: 32,
        display: 'flex',
        gap: 24,
        alignItems: 'flex-start',
      }}
    >

      <div style={{ flex: 3 }}>
        <Title level={2} style={{ fontWeight: 'bold' }}>
          Quy Chế Thi TOEIC Mới Nhất Cần Biết
        </Title>

        <Paragraph style={{ fontSize: '18px', color: '#555' }}>
          Bài viết này cung cấp thông tin quan trọng về quy định thi TOEIC mới được cập nhật trong
          năm 2025, bao gồm điều kiện dự thi, nội quy phòng thi, và cách xử lý vi phạm.
        </Paragraph>

        <img
          src="https://eduphil.com.vn/wp-content/uploads/2018/10/l%E1%BB%87-ph%C3%AD-thi-TOEIC.jpg"
          alt="Ảnh minh họa quy chế thi TOEIC"
          style={{ width: '100%', height: 'auto', borderRadius: 8, margin: '24px 0' }}
        />

        <Divider />
        <Typography style={{ fontSize: '16px', color: '#333' }}>
          <Paragraph>
            Bài thi TOEIC là bài kiểm tra trình độ tiếng Anh giao tiếp trong môi trường làm việc quốc
            tế, vì vậy các quy chế trong phòng thi được áp dụng rất nghiêm ngặt.
          </Paragraph>

          <Paragraph>
            <Text strong>1. Thời gian và quy trình làm bài:</Text> Thí sinh cần có mặt trước giờ thi
            ít nhất 30 phút để làm thủ tục. Sau khi vào phòng, thí sinh không được rời khỏi chỗ ngồi
            nếu chưa được phép.
          </Paragraph>

          <img
            src="https://th.bing.com/th/id/R.9045f6e4d1be310e2738306a0dba1084?rik=ygBkrl9k%2b%2fcRzA&riu=http%3a%2f%2ftosta.vn%2fwp-content%2fuploads%2f2020%2f07%2fThang_diem_TOEIC-768x405.png&ehk=aeBaeq6hO%2bUTToEAt0vBsWzMrGm2fuh4KLsMTYC6FkA%3d&risl=&pid=ImgRaw&r=0"
            alt="Quy trình thi TOEIC"
            style={{ width: '100%', margin: '24px 0', borderRadius: 8 }}
          />

          <Paragraph>
            <Text strong>2. Những vật dụng được mang vào phòng thi:</Text> Chỉ được mang theo CMND/thẻ
            CCCD, bút chì 2B, tẩy, và phiếu dự thi. Các thiết bị điện tử phải để ngoài phòng.
          </Paragraph>

          <Paragraph>
            <Text strong>3. Xử lý vi phạm:</Text> Bất kỳ hành vi gian lận nào như quay cóp, sử dụng
            thiết bị lạ, hoặc trao đổi bài sẽ bị lập biên bản và hủy kết quả thi.
          </Paragraph>

          <Paragraph>
            <Text strong>4. Cập nhật mới từ năm 2025:</Text> Tất cả thí sinh bắt buộc đeo khẩu trang y
            tế và thực hiện khai báo y tế điện tử trước ngày thi 24 giờ.
          </Paragraph>
        </Typography>
      </div>

      <div style={{ flex: 1 , marginLeft:40}}>
        <Title level={4}>Bài viết liên quan</Title>
        <List
          dataSource={relatedPosts}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer', paddingLeft: 0 }}
              onClick={() => onClickRelatedPost(item.id)}
            >
              <Text underline>{item.title}</Text>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default BlogDetail;
