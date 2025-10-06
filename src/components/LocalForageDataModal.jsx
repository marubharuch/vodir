// src/components/LocalForageDataModal.jsx
import React from "react";

const LocalForageDataModal = ({ show, content, onClose, userUid }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg max-w-[90%] max-h-[80%] overflow-y-auto shadow-lg">
        <h3 className="text-lg font-bold border-b pb-2 mb-3">
          LocalForage Data for User: {userUid}
        </h3>
        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
          {content}
        </pre>
        <button
          onClick={onClose}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LocalForageDataModal;
