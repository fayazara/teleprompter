import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlignLeft, AlignCenter, AlignRight, Maximize, Minimize } from 'lucide-react';
import './index.css';

export default function Teleprompter() {
  const [text, setText] = useState(`Enter your script here...`);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [fontSize, setFontSize] = useState(32);
  const [activeSentence, setActiveSentence] = useState(0);
  const [adhdMode, setAdhdMode] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);

  const sentences = text.split('\n').filter(s => s.trim());

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveSentence(prev => {
        if (prev >= sentences.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3000 / speed);

    return () => clearInterval(interval);
}, [isPlaying, speed, sentences.length]);

  useEffect(() => {
    if (sentenceRefs.current[activeSentence] && containerRef.current) {
      const sentenceElement = sentenceRefs.current[activeSentence];
      const container = containerRef.current;
      const sentenceTop = sentenceElement.offsetTop;
      const containerHeight = container.clientHeight;
      const scrollTo = sentenceTop - containerHeight / 2 + sentenceElement.clientHeight / 2;
      
      container.scrollTo({
        top: scrollTo,
        behavior: 'smooth'
      });
    }
  }, [activeSentence]);

  const handleReset = () => {
    setActiveSentence(0);
    setIsPlaying(false);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Controls */}
      <div className="bg-gray-800 p-2 flex items-center gap-2 flex-wrap flex-shrink-0">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-blue-600 hover:bg-blue-700 p-2 rounded"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        
        <button
          onClick={handleReset}
          className="bg-gray-700 hover:bg-gray-600 p-2 rounded"
          title="Reset"
        >
          <RotateCcw size={18} />
        </button>

        <div className="flex items-center gap-1">
          <label className="text-xs">Speed:</label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.2"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-20"
          />
          <span className="text-xs w-8">{speed}x</span>
        </div>

        <div className="flex items-center gap-1">
          <label className="text-xs">Font:</label>
          <input
            type="range"
            min="16"
            max="72"
            step="4"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-20"
          />
          <span className="text-xs w-10">{fontSize}px</span>
        </div>

        <button
          onClick={() => setTextAlign(textAlign === 'left' ? 'center' : textAlign === 'center' ? 'right' : 'left')}
          className="bg-gray-700 hover:bg-gray-600 p-2 rounded"
          title="Text alignment"
        >
          {textAlign === 'left' && <AlignLeft size={18} />}
          {textAlign === 'center' && <AlignCenter size={18} />}
          {textAlign === 'right' && <AlignRight size={18} />}
        </button>

        <button
          onClick={() => setAdhdMode(!adhdMode)}
          className={`px-2 py-2 rounded text-xs font-medium ${adhdMode ? 'bg-green-600' : 'bg-gray-700'}`}
          title="ADHD Mode"
        >
          ADHD
        </button>

        <button
          onClick={toggleFullscreen}
          className="bg-gray-700 hover:bg-gray-600 p-2 rounded"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>

      {/* Text Area / Prompter View */}
      <div className="flex-1 overflow-hidden">
        {!isPlaying ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-full bg-gray-900 text-white p-8 resize-none focus:outline-none"
            style={{ 
              fontSize: `${fontSize}px`, 
              lineHeight: '1.8',
              textAlign: textAlign
            }}
            placeholder="Enter your script here..."
          />
        ) : adhdMode ? (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div
              className="transition-opacity duration-300"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: '1.8',
                maxWidth: '90%',
                textAlign: textAlign
              }}
            >
              {sentences[activeSentence]}
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full h-full overflow-y-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="min-h-full flex flex-col justify-center p-8 py-[50vh]">
              {sentences.map((sentence, index) => (
                <div
                  key={index}
                  ref={el => { sentenceRefs.current[index] = el; }}
                  className="transition-opacity duration-500 mb-8"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.8',
                    opacity: index === activeSentence ? 1 : 0.3,
                    textAlign: textAlign
                  }}
                >
                  {sentence}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}