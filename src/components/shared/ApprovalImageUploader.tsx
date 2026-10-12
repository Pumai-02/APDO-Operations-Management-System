import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { validateImageFile, readFileAsDataURL } from '../../utils/approvalAssets';

interface ApprovalImageUploaderProps {
  label: string;
  description?: string;
  value?: string | null;
  onChange: (dataUrl: string) => void;
  onRemove?: () => void;
  sampleUrl?: string;
  sampleLabel?: string;
  required?: boolean;
  disabled?: boolean;
  aspectRatio?: 'signature' | 'stamp';
}

export const ApprovalImageUploader: React.FC<ApprovalImageUploaderProps> = ({
  label,
  description = 'PNG (transparent recommended), JPEG, SVG, or WebP. Max 5MB.',
  value,
  onChange,
  onRemove,
  sampleUrl,
  sampleLabel = 'Use Authorized Sample',
  required = false,
  disabled = false,
  aspectRatio = 'signature'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      setIsProcessing(true);
      const dataUrl = await readFileAsDataURL(file);
      onChange(dataUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
        {sampleUrl && !value && !disabled && (
          <button
            type="button"
            onClick={() => onChange(sampleUrl)}
            className="text-[11px] font-semibold text-brand-blue hover:text-brand-blue/80 flex items-center gap-1 transition-colors"
            title="Load authentic authorized template image for rapid evaluation"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{sampleLabel}</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {value ? (
        /* Image Preview Box */
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl relative group">
          <div
            className={`w-full rounded-lg border border-slate-200 flex items-center justify-center p-2 relative overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:10px_10px] bg-white ${
              aspectRatio === 'stamp' ? 'h-36' : 'h-24'
            }`}
          >
            <img
              src={value}
              alt={label}
              className={`max-h-full max-w-full object-contain ${
                aspectRatio === 'stamp' ? 'w-28 h-28' : 'w-48 h-20'
              }`}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verified Image Loaded
            </span>

            {!disabled && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 text-[11px] font-medium text-slate-700 hover:text-brand-blue bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Replace
                </button>
                {onRemove && (
                  <button
                    type="button"
                    onClick={onRemove}
                    className="px-2 py-1 text-[11px] font-medium text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Dropzone / Upload Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-brand-blue bg-blue-50/60 ring-2 ring-brand-blue/20'
              : 'border-slate-300 hover:border-brand-blue bg-slate-50/50 hover:bg-slate-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-brand-blue">
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-brand-blue" />
              ) : (
                <UploadCloud className="w-4 h-4 text-brand-blue" />
              )}
            </div>

            <div className="text-xs font-semibold text-slate-700">
              <span className="text-brand-blue hover:underline">Click to browse</span> or drag & drop image
            </div>

            <p className="text-[10px] text-slate-400 max-w-xs leading-tight">
              {description}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
