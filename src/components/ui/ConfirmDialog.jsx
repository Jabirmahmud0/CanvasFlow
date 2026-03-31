import { motion } from 'framer-motion';

const ConfirmDialog = ({ title, message, onConfirm, onCancel, type = 'warning' }) => {
  const buttons = {
    warning: {
      confirm: 'bg-red-500 hover:bg-red-600 text-white',
      cancel: 'bg-slate-700 hover:bg-slate-600 text-slate-200'
    },
    info: {
      confirm: 'bg-indigo-500 hover:bg-indigo-600 text-white',
      cancel: 'bg-slate-700 hover:bg-slate-600 text-slate-200'
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="p-6">
          <p className="text-slate-300 mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${buttons[type].cancel}`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${buttons[type].confirm}`}
            >
              Confirm
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmDialog;
