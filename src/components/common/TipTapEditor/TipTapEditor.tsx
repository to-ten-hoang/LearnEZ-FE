import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useState, useEffect } from 'react';
import api from '../../../lib/axios';
import './TipTapEditor.css';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const TipTapEditor = ({ 
  content, 
  onChange, 
  placeholder = 'Bắt đầu viết nội dung bài blog của bạn...' 
}: TipTapEditorProps) => {
  const [uploading, setUploading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const handleUploadImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post('/api/v1/cloud/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.code === 200) {
          const imageUrl = response.data.data;
          editor?.chain().focus().setImage({ 
            src: imageUrl,
            alt: file.name,
            title: file.name 
          }).run();
        } else {
          alert('Tải ảnh thất bại: ' + (response.data.message || 'Unknown error'));
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        alert('Lỗi khi tải ảnh: ' + (error.response?.data?.message || error.message));
      } finally {
        setUploading(false);
      }
    };

    input.click();
  }, [editor]);

  const handleAddLink = useCallback(() => {
    const url = window.prompt('Nhập URL:');
    if (url) {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const handleRemoveLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
  }, [editor]);

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    children, 
    title 
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // Ngăn mất focus
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`toolbar-btn ${isActive ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''}`}
    >
      {children}
    </button>
  );

  if (!editor) return null;

  return (
    <div className="tiptap-editor">
      <div className="tiptap-toolbar">
        <div className="toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <span style={{ textDecoration: 'line-through' }}>S</span>
          </ToolbarButton>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            H1
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            H2
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            H3
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph')}
            title="Paragraph"
          >
            P
          </ToolbarButton>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            • List
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            1. List
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            "Quote"
          </ToolbarButton>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <ToolbarButton
            onClick={handleAddLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            🔗 Link
          </ToolbarButton>
          
          {editor.isActive('link') && (
            <ToolbarButton
              onClick={handleRemoveLink}
              title="Remove Link"
            >
              🔗❌
            </ToolbarButton>
          )}
          
          <ToolbarButton
            onClick={handleUploadImage}
            disabled={uploading}
            title="Insert Image"
          >
            {uploading ? '⏳' : '🖼️'} {uploading ? 'Uploading...' : 'Image'}
          </ToolbarButton>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </ToolbarButton>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <ToolbarButton
            onClick={() => setIsPreview(!isPreview)}
            isActive={isPreview}
            title="Preview Mode"
          >
            {isPreview ? '✏️ Edit' : '👁️ Preview'}
          </ToolbarButton>
        </div>
      </div>

      {isPreview ? (
        <div className="tiptap-preview">
          <div 
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      ) : (
        <EditorContent editor={editor} className="tiptap-content" />
      )}

      <div className="editor-footer">
        <span className="word-count">
          {editor.storage.characterCount?.characters() || 0} ký tự, {' '}
          {editor.storage.characterCount?.words() || 0} từ
        </span>
      </div>
    </div>
  );
};

export default TipTapEditor;