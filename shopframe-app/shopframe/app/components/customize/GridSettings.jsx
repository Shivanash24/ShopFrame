import { BlockStack, RangeSlider, TextField, Checkbox, Select, InlineStack, Text } from "@shopify/polaris";

export default function GridSettings({ value = {}, onChange }) {
  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <BlockStack gap="400">
      <Select
        label="Desktop Columns"
        options={[
          {label: '2 Columns', value: '2'},
          {label: '3 Columns', value: '3'},
          {label: '4 Columns', value: '4'},
          {label: '5 Columns', value: '5'},
        ]}
        value={value.desktopColumns || '4'}
        onChange={(val) => handleChange("desktopColumns", val)}
      />
      
      <Select
        label="Mobile Columns"
        options={[
          {label: '1 Column', value: '1'},
          {label: '2 Columns', value: '2'},
        ]}
        value={value.mobileColumns || '2'}
        onChange={(val) => handleChange("mobileColumns", val)}
      />

      <Select
        label="Product Card Shape"
        options={[
          {label: 'Square', value: 'square'},
          {label: 'Rounded (Subtle)', value: 'rounded'},
          {label: 'Pill Style', value: 'pill'},
          {label: 'Modern Soft Corners', value: 'soft-corners'},
        ]}
        value={value.cardShape || 'square'}
        onChange={(val) => handleChange("cardShape", val)}
      />

      <Select
        label="Image Ratio"
        options={[
          {label: 'Square (1:1)', value: 'square'},
          {label: 'Portrait (2:3)', value: 'portrait'},
          {label: 'Landscape (4:3)', value: 'landscape'},
        ]}
        value={value.imageRatio || 'square'}
        onChange={(val) => handleChange("imageRatio", val)}
      />

      <TextField
        label="Card Background Color"
        type="color"
        value={value.cardBackgroundColor || "#ffffff"}
        onChange={(val) => handleChange("cardBackgroundColor", val)}
        autoComplete="off"
      />

      <Checkbox
        label="Enable Card Shadow"
        checked={value.cardShadow || false}
        onChange={(checked) => handleChange("cardShadow", checked)}
      />

      <Checkbox
        label="Enable Card Border"
        checked={value.cardBorder || false}
        onChange={(checked) => handleChange("cardBorder", checked)}
      />
      
      <Checkbox
        label="Enable Hover Animation"
        checked={value.hoverAnimation || false}
        onChange={(checked) => handleChange("hoverAnimation", checked)}
      />

      <RangeSlider
        label="Gap Between Products"
        value={value.gap !== undefined ? value.gap : 20}
        onChange={(val) => handleChange("gap", val)}
        min={0}
        max={100}
        output
      />

      <RangeSlider
        label="Padding Inside Cards"
        value={value.padding !== undefined ? value.padding : 0}
        onChange={(val) => handleChange("padding", val)}
        min={0}
        max={50}
        output
      />
    </BlockStack>
  );
}
