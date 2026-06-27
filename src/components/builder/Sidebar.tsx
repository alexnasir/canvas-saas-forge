import React from 'react';
import { 
  MousePointer2, 
  Type, 
  Square, 
  Layout, 
  Image as ImageIcon, 
  CheckSquare, 
  Table as TableIcon,
  PieChart,
  Navigation,
  CreditCard,
  Search,
  Plus
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const componentCategories = [
  {
    name: 'Layout',
    items: [
      { type: 'container', name: 'Container', icon: Layout, props: { className: 'p-6 bg-transparent border-none' } },
      { type: 'card', name: 'Card', icon: CreditCard, props: { title: 'New Card', description: 'Sample description' } },
      { type: 'navbar', name: 'Navbar', icon: Navigation, props: {} },
    ]
  },
  {
    name: 'Basics',
    items: [
      { type: 'button', name: 'Button', icon: MousePointer2, props: { text: 'Click me', variant: 'default' } },
      { type: 'text', name: 'Text', icon: Type, props: { text: 'New Text', className: 'text-base' } },
      { type: 'image', name: 'Image', icon: ImageIcon, props: { src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', alt: 'Sample' } },
    ]
  },
  {
    name: 'Forms',
    items: [
      { type: 'input', name: 'Input', icon: Square, props: { placeholder: 'Enter something...' } },
      { type: 'checkbox', name: 'Checkbox', icon: CheckSquare, props: {} },
    ]
  },
  {
    name: 'Data',
    items: [
      { type: 'chart', name: 'Chart', icon: PieChart, props: {} },
      { type: 'table', name: 'Table', icon: TableIcon, props: {} },
    ]
  }
];

export default function Sidebar() {
  const { addElement, selectedElementId } = useCanvasStore();

  const handleAddComponent = (comp: any) => {
    addElement({
      type: comp.type,
      props: comp.props,
      parentId: selectedElementId || 'root'
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search components..." className="pl-9 h-9" />
        </div>
      </div>
      
      <div className="flex-1 p-4 space-y-6">
        {componentCategories.map((category) => (
          <div key={category.name} className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {category.name}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {category.items.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleAddComponent(item)}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-all group border-muted shadow-sm"
                >
                  <item.icon className="h-5 w-5 mb-2 text-muted-foreground group-hover:text-primary" />
                  <span className="text-[10px] font-medium">{item.name}</span>
                  <Plus className="h-3 w-3 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-muted/30 border-t">
        <Button variant="outline" className="w-full text-xs h-8 border-dashed">
          Import Library
        </Button>
      </div>
    </div>
  );
}
