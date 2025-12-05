import React, { useState } from 'react';
import { Input } from './StyledComponents';

interface FormFieldProps {
  label: string;
  id: keyof any | string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  description?: string;
  isSecret?: boolean;
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({ label, id, type = 'text', placeholder, value, onChange, description, isSecret = false, rows }) => {
  if (rows) {
    return (
      <div className="mb-4">
        <label htmlFor={id as string} className="block text-sm font-medium text-[#b4b7bd] mb-2">
          {label}
        </label>
        <textarea
          id={id as string}
          name={id as string}
          rows={rows}
          value={value as string}
          onChange={onChange}
          className="w-full bg-[#2f3245] border border-[#3b4253] rounded-md p-3.5 text-[#d0d2d6] placeholder-[#676d7d] focus:ring-2 focus:ring-[#6d6bfb] focus:border-transparent transition duration-200"
          placeholder={placeholder}
        />
        {description && <p className="text-xs text-[#676d7d] mt-2">{description}</p>}
      </div>
    );
  }

  return (
    <Input
      label={label}
      id={id as string}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      description={description}
      isSecret={isSecret}
    />
  );
};