// src/components/TeamDirectory.jsx
import React, { useState } from "react";

const teamData = [
  {
    id: "tech",
    teamName: "Tech Wing",
    icon: "💻",
    color: "indigo",
    members: [
      "Sanjay Shah",
      "Virang Mehta",
      "Jainam Shah",
      "Dipen Shah",
      "Kalp Shah",
      "Tirth Shah",
      "Jay Shah",
      "Utsav Shah",
      "Jinal Shah",
      "Hetavi Shah",
    ],
  },
  {
    id: "connect",
    teamName: "Oswal Connectors",
    icon: "🤝",
    color: "teal",
    members: [
      { name: "A", remark: "Admin Anand" },
      { name: "B", remark: "Admin Borsad" },
      { name: "C", remark: "Admin Ahmedabad" },
      { name: "D", remark: "Admin NRI" },
    ],
  },
];

// Fixed Tailwind color mapping
const colorMap = {
  indigo: {
    bg: "bg-indigo-600",
    bgLight: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-400",
  },
  teal: {
    bg: "bg-teal-600",
    bgLight: "bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-400",
  },
};

// Member badge
const MemberName = ({ member }) => {
  const isObj = typeof member === "object";
  return (
    <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition">
      <span className="font-semibold">{isObj ? member.name : member}</span>
      {isObj && (
        <span className="text-xs text-gray-500 ml-1.5">
          ({member.remark})
        </span>
      )}
    </div>
  );
};

const TeamDirectory = () => {
  const [activeTab, setActiveTab] = useState("tech");

  const currentTeam = teamData.find((t) => t.id === activeTab);
  const colors = colorMap[currentTeam.color];

  return (
    <div className="p-2 bg-gray-50 rounded-lg">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-xl font-extrabold text-center text-gray-900 mb-6 border-b-2 border-indigo-200 pb-2">
          🎯 Project Teams
        </h1>

        {/* Tabs */}
        <div className="flex mb-6 bg-white rounded-xl shadow overflow-hidden">
          {teamData.map((team) => {
            const tabColor = colorMap[team.color];

            const active = activeTab === team.id;

            return (
              <button
                key={team.id}
                onClick={() => setActiveTab(team.id)}
                className={`
                  flex-1 py-3 text-center font-semibold text-sm transition
                  ${active ? `${tabColor.bg} text-white` : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                `}
              >
                {team.icon} {team.teamName}
              </button>
            );
          })}
        </div>

        {/* Current Team Box */}
        <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100`}>
          <div className={`flex items-center mb-5 pb-3 border-b-2 ${colors.border}`}>
            <span className="text-xl mr-3">{currentTeam.icon}</span>
            <h2 className={`text-xl font-bold ${colors.text}`}>
              {currentTeam.teamName}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentTeam.members.map((m, i) => (
              <MemberName key={i} member={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDirectory;
