import { ComponentType } from "@prisma/client";

interface ComponentTemplate {
  import: string;
  template: string;
}

interface ComponentProps {
  content?: string;
  style?: React.CSSProperties;
  src?: string;
  alt?: string;
  title?: string;
  data?: Record<string, unknown>[];
  columns?: Record<string, unknown>[];
  value?: string | string[];
  onChange?: (value: unknown) => void;
  options?: string[];
  start?: string;
  end?: string;
  [key: string]: unknown;
}

const componentMap = {
  button: (props: ComponentProps) => 
    `<Button style={${JSON.stringify(props.style)}}>${props.content}</Button>`,
  
  text: (props: ComponentProps) => 
    `<p style={${JSON.stringify(props.style)}}>${props.content}</p>`,
  
  image: (props: ComponentProps) => 
    `<img src="${props.src}" alt="${props.alt || ''}" style={${JSON.stringify(props.style)}} />`,
  
  card: (props: ComponentProps) => 
    `<Card title="${props.title}" style={${JSON.stringify(props.style)}}>${props.content}</Card>`,
  
  table: (props: ComponentProps) => 
    `<Table dataSource={${JSON.stringify(props.data)}} columns={${JSON.stringify(props.columns)}} style={${JSON.stringify(props.style)}} />`,
  
  radio: (props: ComponentProps) => 
    `<Radio.Group value="${props.value}" onChange={onChange}>
      ${props.options?.map(opt => `<Radio key="${opt}" value="${opt}">${opt}</Radio>`).join('\n')}
    </Radio.Group>`,
  
  checkbox: (props: ComponentProps) => 
    `<Checkbox.Group value={${JSON.stringify(props.value)}} onChange={onChange}>
      ${props.options?.map(opt => `<Checkbox key="${opt}" value="${opt}">${opt}</Checkbox>`).join('\n')}
    </Checkbox.Group>`,
  
  date: (props: ComponentProps) => 
    `<DatePicker value="${props.value}" onChange={onChange} style={${JSON.stringify(props.style)}} />`,
  
  dateRange: (props: ComponentProps) => 
    `<DatePicker.RangePicker value={["${props.start}", "${props.end}"]} onChange={onChange} style={${JSON.stringify(props.style)}} />`,
};

export function generateComponentCode(type: string, props: ComponentProps): string {
  const generator = componentMap[type as keyof typeof componentMap];
  if (!generator) {
    return `// Unknown component type: ${type}`;
  }
  return generator(props);
}

export function getRequiredImports(components: { type: string }[]): string[] {
  const imports = new Set<string>();
  imports.add('import React from "react";');
  
  const componentImports = {
    button: 'import { Button } from "antd";',
    card: 'import { Card } from "antd";',
    table: 'import { Table } from "antd";',
    radio: 'import { Radio } from "antd";',
    checkbox: 'import { Checkbox } from "antd";',
    date: 'import { DatePicker } from "antd";',
    dateRange: 'import { DatePicker } from "antd";',
  };

  components.forEach(comp => {
    const importStatement = componentImports[comp.type as keyof typeof componentImports];
    if (importStatement) {
      imports.add(importStatement);
    }
  });

  return Array.from(imports);
}
