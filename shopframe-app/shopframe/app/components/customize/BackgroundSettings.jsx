import { BlockStack, RangeSlider, TextField, Checkbox, Select, Text } from "@shopify/polaris";

export default function BackgroundSettings({ value = {}, onChange }) {
  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <BlockStack gap="400">
      <TextField
        label="Background Color"
        type="color"
        value={value.color || "#ffffff"}
        onChange={(val) => handleChange("color", val)}
        autoComplete="off"
      />
      <TextField
        label="Gradient Options (CSS)"
        value={value.gradient || ""}
        onChange={(val) => handleChange("gradient", val)}
        placeholder="e.g. linear-gradient(90deg, #fff, #000)"
        autoComplete="off"
      />
      <TextField
        label="Background Image URL"
        value={value.imageUrl || ""}
        onChange={(val) => handleChange("imageUrl", val)}
        placeholder="https://example.com/image.jpg"
        autoComplete="off"
      />
      <RangeSlider
        label="Background Opacity"
        value={value.opacity !== undefined ? value.opacity : 100}
        onChange={(val) => handleChange("opacity", val)}
        min={0}
        max={100}
        output
      />
      <RangeSlider
        label="Padding Top/Bottom"
        value={value.padding !== undefined ? value.padding : 40}
        onChange={(val) => handleChange("padding", val)}
        min={0}
        max={150}
        output
      />
      <RangeSlider
        label="Border Radius"
        value={value.borderRadius !== undefined ? value.borderRadius : 0}
        onChange={(val) => handleChange("borderRadius", val)}
        min={0}
        max={100}
        output
      />
    </BlockStack>
  );
}
