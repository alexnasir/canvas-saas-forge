import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Undo2, 
  Redo2, 
  Eye, 
  Rocket, 
  ChevronLeft,
  Settings,
  Share2,
  Monitor,
  Smartphone,
  Tablet,
  MousePointer2,
  Hand
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useProjectStore } from '@/store/useProjectStore';
import Canvas from '@/components/builder/Canvas';
import Sidebar from '@/components/builder/Sidebar';
import Properties from '@/components/builder/Properties';
import Layers from '@/components/builder/Layers';
import { cn } from '@/lib/utils';

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects } = useProjectStore();
  const project = projects.find(p => p.id === id);
  
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('components');
  
  const { undo, redo, elements } = useCanvasStore();

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 bg-card z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">{project.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">v1.0.4 Draft</span>
          </div>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={undo} className="h-8 w-8">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} className="h-8 w-8">
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
          <Button 
            variant={viewport === 'desktop' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setViewport('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewport === 'tablet' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setViewport('tablet')}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewport === 'mobile' ? 'secondary' : 'ghost'} 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setViewport('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
            <Rocket className="h-4 w-4" />
            Deploy
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-80 border-r flex flex-col bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12 px-2">
              <TabsTrigger value="components" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full">Components</TabsTrigger>
              <TabsTrigger value="layers" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full">Layers</TabsTrigger>
              <TabsTrigger value="pages" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full">Pages</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="components" className="m-0 focus-visible:outline-none">
                <Sidebar />
              </TabsContent>
              <TabsContent value="layers" className="m-0 focus-visible:outline-none">
                <Layers />
              </TabsContent>
              <TabsContent value="pages" className="m-0 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Project Pages</h3>
                    <Button variant="outline" size="sm">Add</Button>
                  </div>
                  <div className="p-3 rounded-lg border bg-accent/50 text-sm font-medium border-primary">
                    Home Page (index)
                  </div>
                  <div className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors text-sm">
                    About Us
                  </div>
                  <div className="p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors text-sm">
                    Contact
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </aside>

        {/* Canvas Engine */}
        <main className="flex-1 bg-muted/30 overflow-hidden relative flex flex-col">
          {/* Canvas Toolbar */}
          <div className="h-10 bg-card border-b flex items-center justify-center gap-4 text-xs font-medium text-muted-foreground">
             <div className="flex items-center gap-1">
               <MousePointer2 className="h-3 w-3" />
               Select (V)
             </div>
             <div className="flex items-center gap-1">
               <Hand className="h-3 w-3" />
               Hand (H)
             </div>
          </div>
          
          <div className="flex-1 overflow-auto p-20 flex justify-center">
            <div 
              className={cn(
                "bg-white shadow-2xl transition-all duration-300 min-h-[1000px] relative origin-top",
                viewport === 'desktop' && "w-full max-w-[1280px]",
                viewport === 'tablet' && "w-[768px]",
                viewport === 'mobile' && "w-[375px]"
              )}
            >
              <Canvas />
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 border-l flex flex-col bg-card overflow-y-auto">
          <Properties />
        </aside>
      </div>
    </div>
  );
}
