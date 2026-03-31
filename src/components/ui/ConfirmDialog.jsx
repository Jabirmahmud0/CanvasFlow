import { motion } from 'framer-motion';
import { AlertTriangle, Info, X } from 'lucide-react';

const ConfirmDialog = ({ title, message, onConfirm, onCancel, type = 'warning' }) => {
  const isWarning = type === 'warning';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        className="bg-[hsl(var(--surface-elevated))] border border-border rounded-2xl shadow-2xl shadow-black/50 w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 pb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isWarning ? 'bg-red-500/15 text-red-400' : 'bg-primary/15 text-primary'
          }`}>
            {isWarning ? <AlertTriangle size={18} /> : <Info size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="tool-btn !w-7 !h-7 !rounded-md opacity-40 hover:opacity-100 flex-shrink-0 -mt-1 -mr-1"
          >
            <X size={14} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 pt-0 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
              isWarning
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isWarning ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmDialog;
