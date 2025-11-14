import React, { useState, useCallback, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import EditorCanvas from './components/EditorCanvas';
import { 
  ImageState, 
  EditorSettings, 
  CompressionSettings, 
  ImageFormat 
} from './types';
import { 
  readFileAsDataURL, 
  formatBytes, 
  downloadBlob,
  getExtension
} from './utils/imageUtils';
import { editImageWithGemini } from './services/geminiService';
import { 
  Sliders, 
  Download, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical, 
  Wand2, 
  X, 
  RefreshCw,
  Check,
  Trash2,
  Settings2,
  BookOpen,
  ShieldCheck,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

// Initial States
const initialEditorSettings: EditorSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
};

const initialCompressionSettings: CompressionSettings = {
  quality: 0.8,
  format: ImageFormat.JPEG,
  maxWidth: 1920,
  maxHeight: 1080,
  scale: 1.0,
};

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState | null>(null);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(initialEditorSettings);
  const [compressionSettings, setCompressionSettings] = useState<CompressionSettings>(initialCompressionSettings);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'compress' | 'ai' | 'guide'>('edit');
  const [aiPrompt, setAiPrompt] = useState('');
  
  // We keep a ref to the current canvas to export blobs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Handlers ---

  const handleImageUpload = async (file: File) => {
    try {
      const url = await readFileAsDataURL(file);
      setImageState({
        file,
        originalUrl: url,
        previewUrl: url,
        name: file.name,
        size: file.size,
        type: file.type,
      });
      // Reset settings on new image
      setEditorSettings(initialEditorSettings);
      setCompressionSettings(initialCompressionSettings);
      setActiveTab('edit');
    } catch (error) {
      console.error("Failed to load image", error);
    }
  };

  const handleReset = () => {
    setImageState(null);
    setEditorSettings(initialEditorSettings);
    setCompressionSettings(initialCompressionSettings);
    setAiPrompt('');
    setActiveTab('edit');
  };

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  }, []);

  const handleDownload = () => {
    if (!canvasRef.current || !imageState) return;

    // Create blob from canvas
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const ext = getExtension(compressionSettings.format);
          const filename = `optipix_edited.${ext}`;
          downloadBlob(blob, filename);
        }
      },
      compressionSettings.format,
      compressionSettings.quality
    );
  };

  const handleAIGenerate = async () => {
    if (!canvasRef.current || !aiPrompt) return;
    setIsProcessing(true);
    
    try {
      const currentBase64 = canvasRef.current.toDataURL('image/png');
      const newImageBase64 = await editImageWithGemini(currentBase64, aiPrompt);
      
      // Update the image source to the new AI generated one
      setEditorSettings(initialEditorSettings);
      
      setImageState(prev => prev ? {
        ...prev,
        originalUrl: newImageBase64, // Update the source
        previewUrl: newImageBase64
      } : null);
      
      setAiPrompt('');
    } catch (e) {
      console.error(e);
      alert("Failed to apply AI edit. Check console/API Key.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Render Components ---

  if (!imageState) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-20">
          
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-blue-400 text-sm font-medium mb-4">
                <Zap size={16} className="fill-blue-400/20" />
                <span>New: Gemini AI Powered Editing</span>
             </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                OptiPix
              </span>
              <br />
              <span className="text-3xl md:text-5xl text-slate-300 mt-2 block">
                Image Editor & Compressor
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              A secure, client-side tool to optimize, edit, and transform your images. 
              Free to use, no signup required.
            </p>
          </div>

          {/* Tool Container */}
          <div className="max-w-2xl mx-auto mb-24 shadow-2xl shadow-blue-900/20 rounded-2xl animate-in fade-in zoom-in duration-500">
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-24">
             <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors">
                <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-400 mb-4">
                  <Settings2 size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">Smart Compression</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Reduce file size by up to 90% without visible quality loss. Supports JPG, PNG, and WebP formats to ensure fast website loading speeds.
                </p>
             </div>
             <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:border-purple-500/30 transition-colors">
                <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-400 mb-4">
                  <Wand2 size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">AI-Powered Magic</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Leverage Google Gemini to transform images with text prompts. Remove backgrounds, add elements, or change styles instantly.
                </p>
             </div>
             <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition-colors">
                <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-400 mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">100% Secure</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We prioritize your privacy. All basic edits and compression happen directly in your browser. Your photos are not stored on our servers.
                </p>
             </div>
          </div>

          {/* SEO Article / User Guide */}
          <article className="prose prose-invert prose-lg prose-slate max-w-4xl mx-auto border-t border-slate-800 pt-16 pb-24">
            <h2 className="text-4xl font-bold text-slate-100 mb-12 text-center">The Ultimate Guide to Image Optimization & AI Editing</h2>

            <div className="space-y-12">
              <section>
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Why Image Compression is Critical for SEO</h3>
                <p className="text-slate-400 leading-relaxed">
                  In the modern web, page speed is a direct ranking factor. Large, unoptimized images are the #1 culprit for slow loading websites. 
                  <strong>OptiPix</strong> helps you reduce image file sizes by up to 90% without sacrificing visual quality. 
                  By converting standard JPGs to next-gen formats like <strong>WebP</strong>, you ensure your website loads instantly on mobile devices, improving both user experience and Google search rankings.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-purple-400 mb-4">Harnessing AI for Creative Workflows</h3>
                <p className="text-slate-400 leading-relaxed">
                  Gone are the days of complex Photoshop tutorials. With our integrated <strong>Google Gemini AI</strong>, you can transform images using natural language.
                  Need to turn a photo into a sketch? Want to change the lighting? Just type it. This semantic editing capability allows content creators to generate unique, copyright-free variations of their assets in seconds.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-emerald-400 mb-4">Privacy-First Architecture</h3>
                <p className="text-slate-400 leading-relaxed">
                  Unlike other online converters that upload your sensitive photos to a server, OptiPix runs entirely in your browser using the HTML5 Canvas API and WebAssembly technologies. 
                  Your images never leave your device for basic editing and compression tasks.
                </p>
              </section>

              <section className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
                <h3 className="text-2xl font-bold text-white mb-6">User Manual: How to Use OptiPix</h3>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">1</div>
                    <div>
                      <h4 className="text-xl font-semibold text-slate-200 mb-2">Upload & Import</h4>
                      <p className="text-slate-400">Drag and drop any JPG, PNG, or WebP file into the upload zone. The tool immediately loads the image into memory for instant editing.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">2</div>
                    <div>
                      <h4 className="text-xl font-semibold text-slate-200 mb-2">Edit & Refine</h4>
                      <p className="text-slate-400">Use the sidebar sliders to adjust brightness, contrast, and saturation. Use the transform tools to rotate or flip images for perfect orientation.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white">3</div>
                    <div>
                      <h4 className="text-xl font-semibold text-slate-200 mb-2">AI Generation (Optional)</h4>
                      <p className="text-slate-400">Navigate to the 'AI' tab. Enter a descriptive prompt. Our integration with Google's Gemini model will interpret your request and return a processed image.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white">4</div>
                    <div>
                      <h4 className="text-xl font-semibold text-slate-200 mb-2">Compress & Download</h4>
                      <p className="text-slate-400">Go to the 'Compress' tab. Choose 'WebP' for the best balance of quality and size. Adjust the quality slider (0.8 is recommended). Click 'Save Image' to download the optimized file locally.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </article>
          
          <footer className="text-center text-slate-600 mt-24 border-t border-slate-900 pt-8 text-sm">
             <p>© 2024 OptiPix. All rights reserved.</p>
          </footer>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden bg-slate-950">
      {/* Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center font-bold text-white">
            OP
          </div>
          <span className="font-bold text-lg text-slate-100 hidden md:block">OptiPix</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium px-3 py-2 rounded-md hover:bg-slate-800"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">New Image</span>
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Download size={18} />
            Save Image
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Controls */}
        <div className="w-80 bg-slate-900/95 backdrop-blur border-r border-slate-800 flex flex-col shrink-0 h-full overflow-y-auto">
          
          {/* Tabs */}
          <div className="flex p-2 gap-1 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
            {(['edit', 'compress', 'ai', 'guide'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-md text-xs font-bold transition-all uppercase tracking-wide ${
                  activeTab === tab 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {tab === 'ai' ? 'AI' : tab}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-8 pb-20">
            
            {/* EDIT TAB */}
            {activeTab === 'edit' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Sliders size={14} /> Adjustments
                  </h3>
                  
                  {/* Brightness */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Brightness</span>
                      <span className="text-slate-500">{editorSettings.brightness}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" 
                      value={editorSettings.brightness}
                      onChange={(e) => setEditorSettings({...editorSettings, brightness: Number(e.target.value)})}
                      className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Contrast</span>
                      <span className="text-slate-500">{editorSettings.contrast}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" 
                      value={editorSettings.contrast}
                      onChange={(e) => setEditorSettings({...editorSettings, contrast: Number(e.target.value)})}
                      className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                   {/* Saturation */}
                   <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Saturation</span>
                      <span className="text-slate-500">{editorSettings.saturation}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" 
                      value={editorSettings.saturation}
                      onChange={(e) => setEditorSettings({...editorSettings, saturation: Number(e.target.value)})}
                      className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Blur */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Blur</span>
                      <span className="text-slate-500">{editorSettings.blur}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="20" step="0.5"
                      value={editorSettings.blur}
                      onChange={(e) => setEditorSettings({...editorSettings, blur: Number(e.target.value)})}
                      className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <RefreshCw size={14} /> Transforms
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setEditorSettings(prev => ({...prev, rotation: prev.rotation - 90}))}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg flex flex-col items-center gap-1 transition-colors"
                      title="Rotate Left"
                    >
                      <RotateCcw size={18} />
                      <span className="text-[10px] text-slate-400">Rotate -90°</span>
                    </button>
                    <button 
                      onClick={() => setEditorSettings(prev => ({...prev, rotation: prev.rotation + 90}))}
                      className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg flex flex-col items-center gap-1 transition-colors"
                      title="Rotate Right"
                    >
                      <RotateCw size={18} />
                      <span className="text-[10px] text-slate-400">Rotate +90°</span>
                    </button>
                    <button 
                      onClick={() => setEditorSettings(prev => ({...prev, flipH: !prev.flipH}))}
                      className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-colors ${editorSettings.flipH ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' : 'bg-slate-800 hover:bg-slate-700'}`}
                      title="Flip Horizontal"
                    >
                      <FlipHorizontal size={18} />
                      <span className="text-[10px] text-slate-400">Flip H</span>
                    </button>
                    <button 
                      onClick={() => setEditorSettings(prev => ({...prev, flipV: !prev.flipV}))}
                      className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-colors ${editorSettings.flipV ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' : 'bg-slate-800 hover:bg-slate-700'}`}
                      title="Flip Vertical"
                    >
                      <FlipVertical size={18} />
                      <span className="text-[10px] text-slate-400">Flip V</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* COMPRESS TAB */}
            {activeTab === 'compress' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Settings2 size={14} /> Export Settings
                  </h3>

                  {/* Format */}
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300 block">Format</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.values(ImageFormat).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setCompressionSettings({...compressionSettings, format: fmt})}
                          className={`py-2 text-xs font-bold rounded border transition-all ${
                            compressionSettings.format === fmt 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {fmt.split('/')[1].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Quality</span>
                      <span className="text-slate-500">{Math.round(compressionSettings.quality * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="1" step="0.05"
                      value={compressionSettings.quality}
                      onChange={(e) => setCompressionSettings({...compressionSettings, quality: Number(e.target.value)})}
                      className="w-full accent-emerald-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-xs text-slate-500">Lower quality = smaller file size</p>
                  </div>

                  {/* Scale/Resize */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Resize (Scale)</span>
                      <span className="text-slate-500">{Math.round(compressionSettings.scale * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="1" step="0.1"
                      value={compressionSettings.scale}
                      onChange={(e) => setCompressionSettings({...compressionSettings, scale: Number(e.target.value)})}
                      className="w-full accent-purple-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* Max Dimensions */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                       <label className="text-xs text-slate-400">Max Width</label>
                       <input 
                         type="number" 
                         value={compressionSettings.maxWidth}
                         onChange={(e) => setCompressionSettings({...compressionSettings, maxWidth: Number(e.target.value)})}
                         className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-xs text-slate-400">Max Height</label>
                       <input 
                         type="number" 
                         value={compressionSettings.maxHeight}
                         onChange={(e) => setCompressionSettings({...compressionSettings, maxHeight: Number(e.target.value)})}
                         className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                       />
                     </div>
                  </div>

                </div>
                
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                   <h4 className="text-sm font-medium text-slate-300 mb-2">Info</h4>
                   <div className="text-xs text-slate-400 space-y-1">
                      <p>Original: {formatBytes(imageState.size)}</p>
                      <p>Type: {imageState.type}</p>
                      <p className="text-emerald-400 pt-1">Estimated Output is processed on-device via Canvas API.</p>
                   </div>
                </div>
              </div>
            )}

            {/* AI TAB */}
            {activeTab === 'ai' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="bg-gradient-to-b from-purple-900/20 to-blue-900/10 p-4 rounded-xl border border-purple-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <Wand2 size={20} />
                    <h3 className="font-bold">AI Magic Editor</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Describe how you want to change the image. Gemini AI will regenerate it for you.
                    <br/><br/>
                    <em>Example: "Make it look like a pencil sketch" or "Add a sunset background"</em>
                  </p>

                  <textarea 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-purple-500 focus:outline-none resize-none h-32"
                    placeholder="Describe your edit..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                  
                  <button 
                    disabled={isProcessing || !aiPrompt.trim()}
                    onClick={handleAIGenerate}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 size={16} /> Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* GUIDE TAB */}
            {activeTab === 'guide' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300 overflow-y-auto">
                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 sticky top-0 bg-slate-900 py-2">
                    <BookOpen size={14} /> Application Guide
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors">
                       <h4 className="font-medium text-blue-400 text-sm mb-2 flex items-center gap-2">
                          <Sliders size={14}/> Image Adjustments
                       </h4>
                       <p className="text-xs text-slate-400 leading-relaxed">
                          <strong>Brightness:</strong> Controls overall lightness.<br/>
                          <strong>Contrast:</strong> Adjusts difference between light and dark.<br/>
                          <strong>Saturation:</strong> Controls color intensity.<br/>
                          <strong>Blur:</strong> Softens details for effect or privacy.
                       </p>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-colors">
                       <h4 className="font-medium text-purple-400 text-sm mb-2 flex items-center gap-2">
                          <Wand2 size={14}/> AI Prompting Tips
                       </h4>
                       <p className="text-xs text-slate-400 leading-relaxed">
                          Be specific for best results.
                          <br/><br/>
                          <span className="text-slate-500">Bad:</span> "Make it better"<br/>
                          <span className="text-purple-300">Good:</span> "Cinematic lighting, cyberpunk style, high contrast"
                       </p>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-colors">
                       <h4 className="font-medium text-emerald-400 text-sm mb-2 flex items-center gap-2">
                          <Settings2 size={14}/> Compression Guide
                       </h4>
                       <p className="text-