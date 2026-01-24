'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/lib/store';
import { Image, Upload, Scan, CheckCircle, Plus, X, Edit3, Loader2 } from 'lucide-react';
import { ai } from '@/lib/api';
import { Textarea } from '@/components/ui/textarea';

interface ExtractedItem {
  id: string;
  type: 'task' | 'milestone' | 'deadline';
  title: string;
  details?: string;
  selected: boolean;
}

export default function ImageUploadModal() {
  const { activeModal, openModal, closeModal, project, addTask, activateAgent, addActivity, addNotification, setOnboardingData } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [extractedText, setExtractedText] = useState('');
  const [isMerging, setIsMerging] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);

  const isOpen = activeModal === 'image-upload';

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const startScan = async () => {
    if (!file) return;

    setIsScanning(true);
    setScanProgress(30);
    activateAgent('Planner', 5000);

    try {
      const formData = new FormData();
      formData.append('image', file);
      if (project?._id) {
        formData.append('projectId', project._id);
      }

      const res = await ai.analyzeImage(formData);
      
      setScanProgress(70);
      
      if (res.data) {
        setExtractedText(res.data.extractedText || '');
        
        // Convert recommendation items to our internal format
        const items: ExtractedItem[] = [
          ...(res.data.recommendations?.tasks?.map((t: any, i: number) => ({
            id: `task-${i}`,
            type: 'task',
            title: t.title,
            details: t.description,
            selected: true
          })) || []),
          ...(res.data.recommendations?.milestones?.map((m: any, i: number) => ({
            id: `milestone-${i}`,
            type: 'milestone',
            title: m.name,
            details: `Est. ${m.estimatedWeeks} weeks`,
            selected: true
          })) || []),
          {
            id: 'deadline',
            type: 'deadline',
            title: 'Recommended Deadline',
            details: res.data.recommendations?.recommendedDeadline || 'TBD',
            selected: true
          }
        ];
        
        setExtractedItems(items);
        setScanResults(res.data.recommendations);
        setScanProgress(100);
      }
    } catch (error) {
      console.error('AI Scan failed:', error);
      alert('AI scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }

    if (project) {
      addActivity({
        agent: 'Planner',
        action: `Scanned image and extracted details for ${project.name}`,
        time: 'Just now',
      });
    } else {
      addActivity({
        agent: 'Planner',
        action: `Scanned mission mockup for analysis`,
        time: 'Just now',
      });
    }
  };

  const toggleItem = (id: string) => {
    setExtractedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleMerge = async () => {
    const selectedItems = extractedItems.filter((item) => item.selected);
    if (selectedItems.length === 0) return;

    setIsMerging(true);
    activateAgent('Planner', 2000);

    // Simulate merging
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Add tasks for selected items
    selectedItems
      .filter((item) => item.type === 'task')
      .forEach((item) => {
        const projectId = project?._id || project?.id;
        if (projectId) {
          addTask({
            title: item.title,
            status: 'todo',
            priority: 'medium',
            assignee: 'Unassigned',
            deadline: 'TBD',
            description: item.details,
          }, projectId);
        }
      });

    addNotification({
      agent: 'Planner',
      title: 'Items Merged Successfully',
      message: `${selectedItems.length} items added to project context`,
      type: 'success',
      read: false,
    });

    // Save to onboarding data - pass name, vision and recommendations
    setOnboardingData({ 
      name: scanResults?.name || project?.name || '',
      vision: extractedText,
      recommendations: scanResults 
    });

    setIsMerging(false);
    resetModal();
    closeModal();
    
    // Only open vision modal if we're in the dashboard (project exists)
    // If onboarding, the wizard will update automatically via useEffect
    if (project?._id || project?.id) {
        setTimeout(() => {
            openModal('project-vision');
        }, 150);
    }
  };

  const resetModal = () => {
    setFile(null);
    setPreview(null);
    setIsScanning(false);
    setScanProgress(0);
    setExtractedItems([]);
    setExtractedText('');
    setIsMerging(false);
    setIsEditingText(false);
  };

  const typeConfig = {
    task: { color: '#00F0FF', label: 'Task' },
    milestone: { color: '#00FF88', label: 'Milestone' },
    deadline: { color: '#FFB800', label: 'Deadline' },
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetModal(); closeModal(); } }}>
      <DialogContent className="glass border-[#FFB800]/30 bg-[#0A0E27]/95 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-[#E8F0FF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFB800]/20 border-2 border-[#FFB800]/40 flex items-center justify-center">
              <Image className="w-5 h-5 text-[#FFB800]" />
            </div>
            Image Analysis
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-[#8B9DC3]">
            Upload whiteboards, diagrams, or screenshots to extract tasks and timelines
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {!preview ? (
            /* Upload Zone */
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="glass rounded-2xl p-12 border-2 border-dashed border-[#FFB800]/30 hover:border-[#FFB800]/60 transition-colors text-center cursor-pointer group relative overflow-hidden"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="image-upload-input"
              />
              <div className="flex flex-col items-center gap-4 relative z-0">
                <div className="w-20 h-20 rounded-2xl bg-[#FFB800]/20 border-2 border-[#FFB800]/40 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-[#FFB800]" />
                </div>
                <div>
                  <div className="font-display text-xl font-bold text-[#E8F0FF] mb-2">
                    Drop your image here
                  </div>
                  <div className="font-mono text-sm text-[#8B9DC3]">
                    or click anywhere in this area to browse
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30 font-mono text-xs text-[#FFB800]">
                    Whiteboards
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 font-mono text-xs text-[#00F0FF]">
                    Diagrams
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 font-mono text-xs text-[#9D4EDD]">
                    Screenshots
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Split View */
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Image Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-[#E8F0FF]">Original Image</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetModal}
                    className="text-[#8B9DC3] hover:text-[#E8F0FF]"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
                <div className="glass rounded-2xl p-4 relative overflow-hidden">
                  <img
                    src={preview}
                    alt="Uploaded"
                    className="w-full h-auto rounded-xl max-h-[400px] object-contain"
                  />
                  
                  {/* Scanning Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-[#0A0E27]/80 flex flex-col items-center justify-center rounded-2xl">
                      <div className="relative w-24 h-24 mb-4">
                        <Scan className="w-24 h-24 text-[#FFB800] animate-pulse" />
                        <div
                          className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFB800] rounded-full transition-all duration-200"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      <div className="font-display text-lg font-bold text-[#FFB800]">
                        Scanning... {scanProgress}%
                      </div>
                      <div className="font-mono text-sm text-[#8B9DC3] mt-2">
                        Extracting tasks, milestones, and deadlines
                      </div>
                    </div>
                  )}
                </div>
                
                {!isScanning && extractedItems.length === 0 && (
                  <Button
                    onClick={startScan}
                    className="w-full bg-[#FFB800] hover:bg-[#FFB800]/90 text-[#0A0E27] font-display font-bold rounded-xl glow-amber"
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    Start AI Scan
                  </Button>
                )}

                {/* Extracted Text Review Area */}
                {!isScanning && extractedText && (
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#FFB800] uppercase tracking-widest">Extracted Text</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsEditingText(!isEditingText)}
                        className="h-6 text-[10px] text-[#8B9DC3]"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        {isEditingText ? 'Save' : 'Edit'}
                      </Button>
                    </div>
                    {isEditingText ? (
                      <Textarea 
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                        className="glass border-white/10 text-xs min-h-[150px] text-[#E8F0FF]"
                      />
                    ) : (
                      <div className="glass p-3 rounded-xl border-white/5 bg-white/5 text-[11px] text-[#8B9DC3] leading-relaxed max-h-[150px] overflow-y-auto italic">
                        "{extractedText}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Extracted Items */}
              {extractedItems.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-[#E8F0FF]">
                      Extracted Items ({extractedItems.length})
                    </h3>
                    <span className="font-mono text-xs text-[#8B9DC3]">
                      {extractedItems.filter((i) => i.selected).length} selected
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {extractedItems.map((item) => (
                      <div
                        key={item.id}
                        className={`glass rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                          item.selected ? 'border-2' : 'border-2 border-transparent opacity-60'
                        }`}
                        style={{ borderColor: item.selected ? `${typeConfig[item.type].color}40` : 'transparent' }}
                        onClick={() => toggleItem(item.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={item.selected}
                            onCheckedChange={() => toggleItem(item.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="px-2 py-0.5 rounded-md text-xs font-mono"
                                style={{
                                  backgroundColor: `${typeConfig[item.type].color}20`,
                                  color: typeConfig[item.type].color,
                                }}
                              >
                                {typeConfig[item.type].label}
                              </span>
                            </div>
                            <div className="font-display font-bold text-[#E8F0FF]">{item.title}</div>
                            {item.details && (
                              <div className="font-mono text-xs text-[#8B9DC3] mt-1">{item.details}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={resetModal}
                      className="flex-1 glass border-[#8B9DC3]/30 text-[#8B9DC3] hover:bg-white/5 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleMerge}
                      disabled={isMerging || extractedItems.filter((i) => i.selected).length === 0}
                      className="flex-1 bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0A0E27] font-display font-bold rounded-xl glow-green disabled:opacity-50"
                    >
                      {isMerging ? (
                        <span className="flex items-center gap-2">
                          <Plus className="w-4 h-4 animate-spin" />
                          Merging...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Merge Selected ({extractedItems.filter((i) => i.selected).length})
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
