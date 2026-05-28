import { BlockStack, RangeSlider, TextField, Checkbox, Select } from "@shopify/polaris";

export default function ButtonSettings({ value = {}, onChange }) {
  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <BlockStack gap="400">
      <TextField
        label="Background Color"
        type="color"
        value={value.backgroundColor || "#000000"}
        onChange={(val) => handleChange("backgroundColor", val)}
        autoComplete="off"
      />
      <TextField
        label="Text Color"
        type="color"
        value={value.textColor || "#ffffff"}
        onChange={(val) => handleChange("textColor", val)}
        autoComplete="off"
      />
      <TextField
        label="Hover Background Color"
        type="color"
        value={value.hoverColor || "#333333"}
        onChange={(val) => handleChange("hoverColor", val)}
        autoComplete="off"
      />
      
      <RangeSlider
        label="Border Radius"
        value={value.borderRadius !== undefined ? value.borderRadius : 4}
        onChange={(val) => handleChange("borderRadius", val)}
        min={0}
        max={50}
        output
      />
      
      <RangeSlider
        label="Border Width"
        value={value.borderWidth !== undefined ? value.borderWidth : 0}
        onChange={(val) => handleChange("borderWidth", val)}
        min={0}
        max={10}
        output
      />
      
      {value.borderWidth > 0 && (
        <TextField
          label="Border Color"
          type="color"
          value={value.borderColor || "#000000"}
          onChange={(val) => handleChange("borderColor", val)}
          autoComplete="off"
        />
      )}

      <Select
        label="Button Size"
        options={[
          {label: 'Small', value: 'small'},
          {label: 'Medium', value: 'medium'},
          {label: 'Large', value: 'large'},
        ]}
        value={value.size || 'medium'}
        onChange={(val) => handleChange("size", val)}
      />

      <Checkbox
        label="Full Width Button"
        checked={value.fullWidth || false}
        onChange={(checked) => handleChange("fullWidth", checked)}
      />
      
      <Checkbox
        label="Enable Hover Animation"
        checked={value.hoverAnimation || false}
        onChange={(checked) => handleChange("hoverAnimation", checked)}
      />
    </BlockStack>
  );
}
