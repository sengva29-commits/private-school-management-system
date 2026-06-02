/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, X } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (base64String: string) => void;
  label?: string;
  helperText?: string;
}

export default function ImageUploader({ value, onChange, label, helperText }: ImageUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('សូមជ្រើសរើសតែរូបភាពប៉ុណ្ណោះ! Please select an image file only.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const rawBase64 = event.target.result;
        
        // Load the image to resize and compress on Canvas to fit LocalStorage limits
        const img = new Image();
        img.onload = () => {
          const maxDim = 400; // max dimension to keep image size super light
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            try {
              // Export as PNG to preserve original quality and transparency
              const compressedBase64 = canvas.toDataURL('image/png');
              onChange(compressedBase64);
            } catch (canvasErr) {
              console.warn('Canvas export failed, using raw base64', canvasErr);
              onChange(rawBase64);
            }
          } else {
            onChange(rawBase64);
          }
        };
        img.onerror = () => {
          onChange(rawBase64);
        };
        img.src = rawBase64;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="space-y-1.5 font-sans" id="image-uploader-wrapper">
      {label && <label className="text-[11px] font-bold text-slate-650 block">{label}</label>}
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[140px] ${
          isDragActive
            ? 'border-brand-500 bg-brand-50/50'
            : value
            ? 'border-slate-300 bg-slate-50 hover:bg-slate-100/70'
            : 'border-slate-250 bg-slate-50 hover:bg-slate-100'
        }`}
        id="image-drag-drop-zone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          id="image-file-input"
        />

        {value ? (
          <div className="relative flex flex-col items-center gap-3 w-full" id="uploader-preview-container">
            <div className="relative group w-24 h-24 border-2 border-white shadow-md overflow-hidden rounded-full transition-transform hover:scale-105">
              <img
                src={value}
                alt="Uploaded preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                id="uploader-preview-img"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                id="uploader-remove-overlay-btn"
                title="លុបរូបភាព"
              >
                <Trash2 className="w-5 h-5 text-rose-200" />
              </button>
            </div>
            
            <div className="text-center">
              <span className="text-xs font-bold text-emerald-600 block">✓ បានបញ្ចូលរូបភាពរួចរាល់ (Image Uploaded)</span>
              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">ចុច ឬអូសរូបភាពផ្សេងទៀតពីលើដើម្បីផ្លាស់ប្តូរ</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-2 flex flex-col items-center gap-2" id="uploader-empty-state">
            <div className="w-10 h-10 bg-slate-200/75 rounded-full flex items-center justify-center text-slate-500 mb-1">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-750">
                អូស និងទម្លាក់រូបភាពនៅទីនេះ (Drag & Drop Image Here)
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                ឬចុចដើម្បីជ្រើសរើសពីឧបករណ៍ (or Click to Browse Device)
              </p>
            </div>
          </div>
        )}
      </div>
      {helperText && <p className="text-[10px] text-slate-400 font-semibold block">{helperText}</p>}
    </div>
  );
}
