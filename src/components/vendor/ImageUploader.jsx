import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

export const ImageUploader = ({ 
  onUpload, 
  maxFiles = 5, 
  currentFiles = [] 
}) => {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  
  const remainingFiles = maxFiles - currentFiles.length;
  const isLimitReached = remainingFiles <= 0;
  
  const validateFiles = (files) => {
    // Check file count
    if (files.length > remainingFiles) {
      setError(t('common.product_form.max_images_error', { max: maxFiles }));
      return false;
    }
    
    // Check file types and sizes
    for (const file of files) {
      // Check file type
      if (!file.type.match(/image\/(jpeg|JPEG|jpg|png|webp)/i)) {
        setError(t('invalid_file_type', 'Invalid file type. Only JPEG, PNG, and WEBP files are allowed.'));
        return false;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError(t('file_too_large', 'File too large. Maximum size is 5MB.'));
        return false;
      }
    }
    
    return true;
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragActive(false);
    setError('');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      
      if (validateFiles(filesArray)) {
        onUpload(filesArray);
      }
    }
  };
  
  const handleDragState = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleChange = (e) => {
    e.preventDefault();
    setError('');
    
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      if (validateFiles(filesArray)) {
        onUpload(filesArray);
        // Reset input value so the same file can be selected again if needed
        e.target.value = '';
      }
    }
  };
  
  const handleClick = () => {
    if (inputRef.current && !isLimitReached) {
      inputRef.current.click();
    }
  };
  
  return (
    <div className="w-full">
      {/* Error message */}
      {error && (
        <div className="mb-3 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Upload area */}
      <div
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6
          ${isLimitReached 
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
            : dragActive 
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary cursor-pointer'
          }`}
        onDragEnter={handleDragState}
        onDragLeave={handleDragState}
        onDragOver={handleDragState}
        onDrop={isLimitReached ? undefined : handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
          onChange={handleChange}
          disabled={isLimitReached}
        />
        
        <Upload className="h-10 w-10 text-gray-400 mb-3" />
        
        <p className="text-sm font-medium text-gray-700">
          {isLimitReached 
            ? t('common.product_form.max_images_reached')
            : t('common.product_form.click_to_upload_images')
          }
        </p>
        
        <p className="text-xs text-gray-500 mt-1">
          {t('common.product_form.image_requirements')} ({remainingFiles} remaining)
        </p>
      </div>
    </div>
  );
};

ImageUploader.propTypes = {
  onUpload: PropTypes.func.isRequired,
  maxFiles: PropTypes.number,
  currentFiles: PropTypes.array
};

export default ImageUploader;
