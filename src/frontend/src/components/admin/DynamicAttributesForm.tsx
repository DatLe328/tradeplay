import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { type GameFieldSchema, type GameAttributes } from '@/types/gameSchemas';

interface DynamicAttributesFormProps {
  schema: GameFieldSchema[];
  attributes: GameAttributes;
  onChange: (attributes: GameAttributes) => void;
}

export function DynamicAttributesForm({ schema, attributes, onChange }: DynamicAttributesFormProps) {
  const handleFieldChange = (key: string, value: string | number | boolean | string[]) => {
    onChange({
      ...attributes,
      [key]: value,
    });
  };

  if (schema.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <Gamepad2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Chọn game để hiển thị các thuộc tính
        </p>
      </div>
    );
  }

  // Group fields by type for better layout
  const numberFields = schema.filter(f => f.type === 'number');
  const selectFields = schema.filter(f => f.type === 'select');
  const multiSelectFields = schema.filter(f => f.type === 'multi-select');
  const booleanFields = schema.filter(f => f.type === 'boolean');
  const textFields = schema.filter(f => f.type === 'text');

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="attributes-form"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Gamepad2 className="h-4 w-4" />
          <span>Thuộc tính Game</span>
        </div>

        {/* Number & Select fields in grid */}
        {(numberFields.length > 0 || selectFields.length > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...numberFields, ...selectFields].map((field) => (
              <DynamicFieldRenderer
                key={field.key}
                field={field}
                value={attributes[field.key]}
                onChange={handleFieldChange}
              />
            ))}
          </div>
        )}

        {/* Text fields */}
        {textFields.map((field) => (
          <DynamicFieldRenderer
            key={field.key}
            field={field}
            value={attributes[field.key]}
            onChange={handleFieldChange}
          />
        ))}

        {/* Multi-select fields */}
        {multiSelectFields.length > 0 && (
          <div className="space-y-4">
            {multiSelectFields.map((field) => (
              <DynamicFieldRenderer
                key={field.key}
                field={field}
                value={attributes[field.key]}
                onChange={handleFieldChange}
              />
            ))}
          </div>
        )}

        {/* Boolean fields */}
        {booleanFields.length > 0 && (
          <div className="space-y-2">
            {booleanFields.map((field) => (
              <DynamicFieldRenderer
                key={field.key}
                field={field}
                value={attributes[field.key]}
                onChange={handleFieldChange}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
