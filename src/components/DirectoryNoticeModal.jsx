import React from "react";

const DirectoryNoticeModal = ({ show, onClose }) => {
  if (!show) return null;

  return (
   <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fadeIn">

      <div className="bg-white p-5 rounded-xl shadow-xl w-11/12 max-w-md animate-slideUp">

        <h2 className="text-xl font-bold text-indigo-700 mb-2">
          સમાજ ડિરેક્ટરી અપડેટ
        </h2>

        <p className="text-gray-700 mb-3">
          સમાજની ડિરેક્ટરીને <strong>સાચી અને અપડેટેડ</strong> રાખવું દરેક સભ્યની 
          જવાબદારી છે. આપના સહયોગ બદલ આભાર.
        </p>

        <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100 mb-4">
          <p className="font-semibold text-indigo-700 mb-1">📢 મહત્વપૂર્ણ સૂચના:</p>
          <p className="text-sm text-gray-700">
            પ્રથમ તબક્કામાં, આપણે ટેલિફોન/મોબાઇલ ડિરેક્ટરી બનાવી રહ્યા છીએ.
            કૃપા કરીને તમારા પરિવારના દરેક સભ્યની વિગતો ઉમેરો.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DirectoryNoticeModal;
