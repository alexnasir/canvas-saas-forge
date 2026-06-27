import React from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCanvasStore, CanvasElement } from '@/store/useCanvasStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ElementRenderer = ({ element }: { element: CanvasElement }) => {
  const { selectElement, selectedElementId } = useCanvasStore();
  const isSelected = selectedElementId === element.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
  };

  const commonClasses = cn(
    "relative transition-all duration-200",
    isSelected && "ring-2 ring-primary ring-offset-2",
    !isSelected && "hover:ring-1 hover:ring-primary/50"
  );

  switch (element.type) {
    case 'container':
      return (
        <div 
          onClick={handleClick}
          className={cn(commonClasses, element.props.className)}
        >
          {element.children?.map(childId => (
            <CanvasElementWrapper key={childId} id={childId} />
          ))}
          {element.children?.length === 0 && (
            <div className="h-24 flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground bg-muted/10">
              Empty Container - Drop items here
            </div>
          )}
        </div>
      );
    case 'button':
      return (
        <div onClick={handleClick} className={cn(commonClasses, "inline-block")}>
          <Button {...element.props}>{element.props.text || 'Button'}</Button>
        </div>
      );
    case 'text':
      return (
        <div onClick={handleClick} className={cn(commonClasses)}>
          <p {...element.props}>{element.props.text || 'Add text here...'}</p>
        </div>
      );
    case 'input':
      return (
        <div onClick={handleClick} className={cn(commonClasses, "w-full")}>
          <Input {...element.props} />
        </div>
      );
    case 'card':
      return (
        <div onClick={handleClick} className={cn(commonClasses, "p-6 rounded-xl border bg-card shadow-sm")}>
          <h3 className="font-bold mb-2">{element.props.title || 'Card Title'}</h3>
          <p className="text-sm text-muted-foreground">{element.props.description || 'Card description goes here.'}</p>
        </div>
      );
    default:
      return null;
  }
};

const CanvasElementWrapper = ({ id }: { id: string }) => {
  const element = useCanvasStore(state => state.elements[id]);
  if (!element) return null;
  return <ElementRenderer element={element} />;
};

export default function Canvas() {
  const { elements, selectElement } = useCanvasStore();

  return (
    <div 
      className="min-h-full w-full outline-none" 
      onClick={() => selectElement(null)}
    >
      <CanvasElementWrapper id="root" />
    </div>
  );
}
