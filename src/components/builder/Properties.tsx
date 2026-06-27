import React from 'react';
import { 
  Settings2, 
  Palette, 
  Zap, 
  Trash2, 
  Type, 
  Layout, 
  Box,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Properties() {
  const { selectedElementId, elements, updateElement, removeElement } = useCanvasStore();
  const selectedElement = selectedElementId ? elements[selectedElementId] : null;

  if (!selectedElement) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <Settings2 className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">Select an element on the canvas to edit its properties.</p>
      </div>
    );
  }

  const handlePropChange = (key: string, value: any) => {
    updateElement(selectedElementId!, {
      props: { ...selectedElement.props, [key]: value }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded">
            <Box className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-sm capitalize">{selectedElement.type}</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-destructive"
          onClick={() => removeElement(selectedElementId!)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="style" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-10 px-2">
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
          <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">Advanced</TabsTrigger>
        </TabsList>

        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          <TabsContent value="style" className="m-0 space-y-6">
            {/* Content Section */}
            {(selectedElement.type === 'text' || selectedElement.type === 'button') && (
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content</Label>
                <div className="space-y-2">
                  <Label htmlFor="text-content" className="text-xs">Text Value</Label>
                  <Input 
                    id="text-content"
                    value={selectedElement.props.text || ''} 
                    onChange={(e) => handlePropChange('text', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Typography */}
            {selectedElement.type === 'text' && (
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Typography</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Size</Label>
                    <Select value={selectedElement.props.fontSize || '16'} onValueChange={(v) => handlePropChange('fontSize', v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">Small</SelectItem>
                        <SelectItem value="16">Medium</SelectItem>
                        <SelectItem value="24">Large</SelectItem>
                        <SelectItem value="48">Hero</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Weight</Label>
                    <Select value={selectedElement.props.fontWeight || '400'} onValueChange={(v) => handlePropChange('fontWeight', v)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Weight" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">Light</SelectItem>
                        <SelectItem value="400">Regular</SelectItem>
                        <SelectItem value="600">Semi Bold</SelectItem>
                        <SelectItem value="700">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8"><AlignLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8"><AlignCenter className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8"><AlignRight className="h-4 w-4" /></Button>
                  <Separator orientation="vertical" className="h-4 mx-1" />
                  <Button variant="outline" size="icon" className="h-8 w-8"><Bold className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-8 w-8"><Italic className="h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {/* Spacing */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Spacing</Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Padding</Label>
                    <span className="text-[10px] text-muted-foreground">{selectedElement.props.padding || 0}px</span>
                  </div>
                  <Slider 
                    value={[selectedElement.props.padding || 0]} 
                    max={100} 
                    step={1}
                    onValueChange={([val]) => handlePropChange('padding', val)}
                  />
                </div>
                <div className="space-y-2">
                   <div className="flex items-center justify-between">
                    <Label className="text-xs">Margin</Label>
                    <span className="text-[10px] text-muted-foreground">{selectedElement.props.margin || 0}px</span>
                  </div>
                  <Slider 
                    value={[selectedElement.props.margin || 0]} 
                    max={100} 
                    step={1}
                    onValueChange={([val]) => handlePropChange('margin', val)}
                  />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Colors</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Text</Label>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded border cursor-pointer bg-foreground" />
                    <Input className="h-8 text-xs font-mono" defaultValue="#000000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Background</Label>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded border cursor-pointer bg-background" />
                    <Input className="h-8 text-xs font-mono" defaultValue="#FFFFFF" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="m-0">
             <div className="flex flex-col items-center justify-center py-12 text-center">
               <Zap className="h-8 w-8 mb-2 text-primary opacity-50" />
               <p className="text-xs font-medium text-muted-foreground">Connect this component to a data source to enable dynamic content.</p>
               <Button variant="link" className="text-xs mt-2">Learn more</Button>
             </div>
          </TabsContent>

          <TabsContent value="advanced" className="m-0 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Element ID</Label>
              <Input className="h-8 text-xs font-mono" value={selectedElement.id} readOnly />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Custom CSS Classes</Label>
              <Input 
                className="h-8 text-xs" 
                value={selectedElement.props.className || ''} 
                onChange={(e) => handlePropChange('className', e.target.value)}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="p-4 border-t bg-muted/5">
        <Button variant="secondary" className="w-full text-xs h-8">
          Copy Styles
        </Button>
      </div>
    </div>
  );
}
