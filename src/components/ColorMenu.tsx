import React, { useState } from "react";

export const ColorPickerMenu: React.FC<{
  onChange: (color: string) => void;
}> = ({ onChange }) => {
  const [selectedColor, setSelectedColor] = useState<string>("");

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onChange(selectedColor);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="color" value={selectedColor} onChange={handleColorChange} />
      <button type="submit">Change Color</button>
    </form>
  );
};
