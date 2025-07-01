import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useCallback } from 'react';
import api from '../../../lib/axios';
import './TipTapEditor.css';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TipTapEditor = ({ content, onChange }: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // Trả về chuỗi HTML
    },
  });

  const handleUploadImage = useCallback(
    async (file: File) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/v1/cloud/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data.code === 200) {
          const imageUrl = response.data.data;
          editor?.chain().focus().setImage({ src: imageUrl }).run();
          message.success('Tải ảnh lên thành công!');
        } else {
          message.error('Tải ảnh thất bại.');
        }
      } catch (error) {
        message.error('Lỗi khi tải ảnh lên.');
      }
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div className="tiptap-editor">
      <div className="tiptap-toolbar">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          Bold
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          Italic
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          H1
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </Button>
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            handleUploadImage(file);
            return false; // Ngăn upload tự động
          }}
        >
          <Button icon={<UploadOutlined />}>Chèn ảnh</Button>
        </Upload>
      </div>
      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  );
};

export default TipTapEditor;