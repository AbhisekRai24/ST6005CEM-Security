import React from 'react';

export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 w-full max-w-md rounded-2xl shadow-lg animate-fade-in">
                <h2 className="text-2xl font-semibold mb-4 text-[#A62123] text-center">{title}</h2>
                <p className="text-gray-700 text-center mb-6">{description}</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-[#A62123] text-white hover:bg-white hover:text-[#A62123] border border-[#A62123] transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
