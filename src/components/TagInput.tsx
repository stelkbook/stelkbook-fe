import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ value, onChange, placeholder = "(tags baru...)" }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Parsing value string menjadi array tags
  const tags = value ? value.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

  const addTag = (rawTag: string) => {
    const normalized = rawTag.trim().toLowerCase();
    if (!normalized) return;

    // Format tag (tambahkan # jika belum ada)
    const formattedTag = normalized.startsWith('#') ? normalized : `#${normalized}`;
    
    // Validasi duplikat
    if (tags.some(t => t.toLowerCase() === formattedTag)) {
      setInputValue(''); // Clear input duplicate tapi jangan tambah
      return;
    }

    const newTags = [...tags, formattedTag];
    onChange(newTags.join(', '));
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(newTags.join(', '));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if ((e.key === 'Backspace' || e.key === 'Delete') && inputValue === '') {
      if (tags.length > 0) {
        removeTag(tags.length - 1);
      }
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    // Split berdasarkan koma, titik koma, atau spasi/newline
    const items = text.split(/[,;\n\r\t]+/).filter(Boolean);
    
    let currentTags = [...tags];
    let hasChanges = false;

    items.forEach(item => {
      let tagToAdd = item.trim().toLowerCase();
      if (!tagToAdd) return;
      if (!tagToAdd.startsWith('#')) tagToAdd = '#' + tagToAdd;
      
      if (!currentTags.some(t => t === tagToAdd)) {
        currentTags.push(tagToAdd);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      onChange(currentTags.join(', '));
    }
    setInputValue('');
  };

  return (
    <div className="w-full">
      <style jsx>{`
        .tags-field {
          --chip-bg: #c55252;
          --chip-text: #fff;
          --chip-radius: 16px;
          --chip-gap: 8px;
          --input-bg: #fafafa;
          --input-text: #333;
          --placeholder: #bdbdbd;
          --focus: #7e9cff;
          --transition: 160ms cubic-bezier(.2,.6,.2,1);

          display: flex;
          flex-wrap: wrap;
          gap: var(--chip-gap);
          padding: 8px;
          border: 1px solid #e2e2e2;
          border-radius: 12px;
          background: var(--input-bg);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .tags-field:focus-within {
          border-color: var(--focus);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus) 20%, transparent);
        }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: var(--chip-bg);
          color: var(--chip-text);
          border-radius: var(--chip-radius);
          font: 500 14px/1.1 ui-sans-serif, system-ui, Segoe UI, Arial;
          white-space: nowrap;
          animation: chipEnter var(--transition) forwards;
        }

        @keyframes chipEnter {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .chip .remove {
          width: 18px;
          height: 18px;
          display: grid;
          place-items: center;
          border: none;
          background: transparent;
          color: inherit;
          cursor: pointer;
          border-radius: 50%;
          font-size: 16px;
          line-height: 1;
          padding: 0;
        }

        .chip .remove:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .tag-input {
          flex: 1 1 120px;
          min-width: 120px;
          padding: 6px 0;
          background: transparent;
          color: var(--input-text);
          border: none;
          font: 500 14px ui-sans-serif, system-ui, Segoe UI, Arial;
        }
        
        .tag-input:focus {
          outline: none;
        }
        
        .tag-input::placeholder {
          color: var(--placeholder);
        }
      `}</style>

      <div 
        className="tags-field" 
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} className="chip">
            <span className="label">{tag}</span>
            <button
              type="button"
              className="remove"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              aria-label={`Hapus tag ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="tag-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onPaste={handlePaste}
          placeholder={tags.length === 0 ? placeholder : ""}
          aria-label="Tambah tag"
        />
      </div>
    </div>
  );
};

export default TagInput;
