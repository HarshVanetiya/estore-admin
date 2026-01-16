import React from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'confirm';
    confirmText?: string;
    cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'error',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={24} className="text-emerald-400" />;
            case 'confirm': return <HelpCircle size={24} className="text-honey" />;
            default: return <AlertCircle size={24} className="text-red-400" />;
        }
    };

    const getIconBg = () => {
        switch (type) {
            case 'success': return 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
            case 'confirm': return 'bg-honey/10 border-honey/20 shadow-[0_0_15px_rgba(255,191,0,0.2)]';
            default: return 'bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card relative w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-ash-grey hover:text-beige transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 mb-4 rounded-full flex items-center justify-center border ${getIconBg()}`}>
                        {getIcon()}
                    </div>

                    <h3 className="text-xl font-bold text-beige mb-2 tracking-wide">
                        {title}
                    </h3>

                    <p className="text-ash-grey/80 text-sm mb-6 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        {onConfirm ? (
                            <>
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-white/5 text-ash-grey rounded-xl font-bold font-sans hover:bg-white/10 transition-all duration-200"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => { onConfirm(); onClose(); }}
                                    className="flex-1 py-3 bg-beige text-dark-teal rounded-xl font-bold font-sans shadow-lg hover:bg-white active:scale-95 transition-all duration-200"
                                >
                                    {confirmText}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-beige text-dark-teal rounded-xl font-bold font-sans shadow-lg hover:bg-white active:scale-95 transition-all duration-200"
                            >
                                Dismiss
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.getElementById('portal-root') || document.body
    );
};

export default Modal;
