import React from "react";

export default function FamilyTree({ members, onClose }) {
  const head = members.find((m) => m.isHead);
  const others = members.filter((m) => !m.isHead);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🌳 Family Tree</h2>
        <button
          onClick={onClose}
          className="text-red-600 font-semibold hover:underline"
        >
          ✖ Close
        </button>
      </div>

      <div className="flex flex-col items-center space-y-6">
        {/* Head */}
        {head && (
          <div className="bg-indigo-100 px-4 py-2 rounded font-bold text-center">
            👤 {head.name} ({head.gender})
            <div className="text-sm text-slate-600">{head.phone}</div>
          </div>
        )}

        {/* Members */}
        <div className="grid grid-cols-2 gap-4">
          {others.map((m, i) => (
            <div key={i} className="bg-slate-100 px-3 py-2 rounded text-center">
              {m.name} ({m.gender})
              <div className="text-sm text-slate-500">{m.phone}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
