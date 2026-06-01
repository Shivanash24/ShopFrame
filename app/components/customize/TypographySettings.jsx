import { BlockStack, RangeSlider, TextField, Select, ButtonGroup, Button } from "@shopify/polaris";
import { TextAlignLeftIcon, TextAlignCenterIcon, TextAlignRightIcon } from "@shopify/polaris-icons";

export default function TypographySettings({ value = {}, onChange }) {
  const handleChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  const alignmentOptions = [
    { value: 'left', icon: TextAlignLeftIcon },
    { value: 'center', icon: TextAlignCenterIcon },
    { value: 'right', icon: TextAlignRightIcon },
  ];

  return (
    <BlockStack gap="400">
      <RangeSlider
        label="Font Size"
        value={value.fontSize !== undefined ? value.fontSize : 16}
        onChange={(val) => handleChange("fontSize", val)}
        min={10}
        max={100}
        output
      />
      
      <Select
        label="Font Weight"
        options={[
          {label: 'Normal', value: '400'},
          {label: 'Medium', value: '500'},
          {label: 'Semibold', value: '600'},
          {label: 'Bold', value: '700'},
          {label: 'Black', value: '900'},
        ]}
        value={value.fontWeight || '400'}
        onChange={(val) => handleChange("fontWeight", val)}
      />

      <TextField
        label="Text Color"
        type="color"
        value={value.color || "#000000"}
        onChange={(val) => handleChange("color", val)}
        autoComplete="off"
      />

      <RangeSlider
        label="Letter Spacing (px)"
        value={value.letterSpacing !== undefined ? value.letterSpacing : 0}
        onChange={(val) => handleChange("letterSpacing", val)}
        min={-5}
        max={20}
        output
      />

      <BlockStack gap="200">
        <p>Text Alignment</p>
        <ButtonGroup segmented>
          {alignmentOptions.map((opt) => (
            <Button
              key={opt.value}
              icon={opt.icon}
              pressed={value.textAlign === opt.value}
              onClick={() => handleChange("textAlign", opt.value)}
            />
          ))}
        </ButtonGroup>
      </BlockStack>
    </BlockStack>
  );
}
