
import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MobileControlsProps {
  onMove: (direction: string) => void;
}

const MobileControls: React.FC<MobileControlsProps> = ({ onMove }) => {
  return (
    <div className="fixed bottom-8 left-0 right-0 flex flex-col items-center z-10">
      <div className="grid grid-cols-3 gap-2">
        <div className="col-start-2">
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-md shadow-lg"
            onClick={() => onMove('ArrowUp')}
            aria-label="Move up"
          >
            <ArrowUp className="h-6 w-6" />
          </button>
        </div>
        <div className="col-start-1 row-start-2">
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-md shadow-lg"
            onClick={() => onMove('ArrowLeft')}
            aria-label="Move left"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
        <div className="col-start-2 row-start-2">
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-md shadow-lg"
            onClick={() => onMove('ArrowDown')}
            aria-label="Move down"
          >
            <ArrowDown className="h-6 w-6" />
          </button>
        </div>
        <div className="col-start-3 row-start-2">
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-md shadow-lg"
            onClick={() => onMove('ArrowRight')}
            aria-label="Move right"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileControls;
