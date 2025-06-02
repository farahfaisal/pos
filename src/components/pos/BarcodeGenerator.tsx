import React, { useEffect, useRef } from 'react';
import { BrowserQRCodeSvgWriter } from '@zxing/browser';
import { BarcodeFormat, EncodeHintType } from '@zxing/library';

interface BarcodeGeneratorProps {
  value: string;
  width?: number;
  height?: number;
  format?: BarcodeFormat;
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({ 
  value, 
  width = 200, 
  height = 100,
  format = BarcodeFormat.CODE_128
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !value) return;

    const writer = new BrowserQRCodeSvgWriter();
    const hints = new Map();
    
    // Set encoding hints for better quality
    hints.set(EncodeHintType.MARGIN, 1);
    hints.set(EncodeHintType.WIDTH, width);
    hints.set(EncodeHintType.HEIGHT, height);

    // Clear previous content
    containerRef.current.innerHTML = '';

    try {
      writer.write(value, width, height, hints)
        .then(svgElement => {
          if (containerRef.current) {
            // Style the SVG
            svgElement.setAttribute('class', 'w-full h-full');
            containerRef.current.appendChild(svgElement);
          }
        })
        .catch(error => {
          console.error('Error generating barcode:', error);
          if (containerRef.current) {
            containerRef.current.innerHTML = '<p class="text-red-600 text-sm">خطأ في إنشاء الباركود</p>';
          }
        });
    } catch (error) {
      console.error('Error generating barcode:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = '<p class="text-red-600 text-sm">خطأ في إنشاء الباركود</p>';
      }
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [value, width, height, format]);

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center items-center bg-white p-4 rounded-lg"
      style={{ minHeight: height }}
    />
  );
};

export default BarcodeGenerator;