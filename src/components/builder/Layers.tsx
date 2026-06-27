import React from 'react';
import { 
  Box, 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Type,
  MousePointer2,
  Square,
  Layout,
  Image as ImageIcon,
  CreditCard
} from 'lucide-react';
import { useCanvasStore, CanvasElement } from '@/store/useCanvasStore';
import { cn } from '@/lib/utils';

const getIcon = (type: string) => {
  switch (type) {
    case 'container': return Layout;
    case 'text': return Type;
    case 'button': return MousePointer2;
    case 'input': return Square;
    case 'image': return ImageIcon;
    case 'card': return CreditCard;
    default: return Box;
  }
};

const LayerItem = ({ id, depth = 0 }: { id: string, depth?: number }) => {
  const { elements, selectedElementId, selectElement } = useCanvasStore();
  const element = elements[id];
  if (!element) return null;

  const isSelected = selectedElementId === id;
  const Icon = getIcon(element.type);
  const hasChildren = element.children && element.children.length > 0;

  return (
    <div className="flex flex-col">
      <div 
        onClick={() => selectElement(id)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-accent group transition-colors",
          isSelected && "bg-primary/10 border-l-2 border-primary"
        )}
        style={{ paddingLeft: `${(depth * 12) + 12}px` }}
      >
        {hasChildren ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        ) : (
          <div className="w-3" />
        )}
        <Icon className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
        <span className={cn(
          "text-xs font-medium truncate",
          isSelected ? "text-primary" : "text-foreground"
        )}>
          {element.type === 'container' ? 'Container' : element.props.text || element.type}
        </span>
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          <Unlock className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </div>
      </div>
      {hasChildren && (
        <div className="flex flex-col">
          {element.children!.map(childId => (
            <LayerItem key={childId} id={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Layers() {
  const { elements } = useCanvasStore();

  return (
    <div className="flex flex-col h-full py-2">
      <LayerItem id="root" />
    </div>
  );
}
