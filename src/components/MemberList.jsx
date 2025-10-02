import React from "react";

const MemberList = ({ members, startEditMember, deleteMember }) => {
  return (
    <>
      <h2 className="text-lg font-bold mt-3">👥 ઉમેરાયેલા સભ્યો</h2>
      {members.map((m) => (
        <div
          key={m.id}
          className="flex justify-between items-center border p-2 m-1 rounded"
        >
          <span>
            {m.gender}: {m.name} ({m.countryCode} {m.mobile})
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => startEditMember(m.id)}
              className="bg-yellow-400 px-2 py-1 rounded"
            >
              ✏️
            </button>
            <button
              onClick={() => deleteMember(m.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

export default MemberList;