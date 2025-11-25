import React from 'react';

const teamData = [
  {
    teamName: "Tech wing ",
    icon: "💻",
    color: "indigo", // Use indigo theme for coders
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
      "Hetavi Shah"
    ],
  },
  {
    teamName: "Oswal Connectors",
    icon: "🤝",
    color: "teal", // Use teal theme for connectors
    members: [
      { name: "A", remark: "Admin Anand" },
      { name: " B", remark: "Admin Borsad" },
      { name: " C", remark: "Admin Ahmedabad" },
      { name: "D", remark: "Admin NRI" },
    ],
  },
];

// Helper component for a single member display
const MemberName = ({ member }) => {
    const isObject = typeof member === 'object';
    const name = isObject ? member.name : member;
    const remark = isObject ? `(${member.remark})` : null;

    return (
        // Styled as a small, clean pill/badge
        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition duration-150">
            <span className="font-semibold">{name}</span>
            {remark && (
                // Lighter text for the remark/role
                <span className="text-xs text-gray-500 ml-1.5">{remark}</span>
            )}
        </div>
    );
};

// Main Team Directory Component
const TeamDirectory = () => {
  return (
    // Padded container with a light background for contrast
    <div className="p-1 sm:p-2 bg-gray-50 rounded-lg">
      <div className="max-w-4xl mx-auto">
        
        {/* Global Title */}
        <h1 className="text-xl font-extrabold text-center text-gray-900 mb-8 border-b-2 border-indigo-200 pb-2">
          🎯 Project Teams
        </h1>

        {/* --- Team Sections: Use a grid for better layout on larger screens --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {teamData.map((team, index) => (
            <div 
              key={index} 
              // Card styling: Shadow, rounded corners, white background
              className="bg-white p-6 rounded-xl shadow-l border border-gray-100"
            >
              
              {/* Team Header */}
              <div className={`flex items-center mb-5 pb-3 border-b-2 border-${team.color}-400`}>
                <span className="text-l mr-3">{team.icon}</span>
                <h2 className={`text-xl font-bold text-${team.color}-700`}>
                  {team.teamName}
                </h2>
              </div>
              
              {/* Member List - Styled as a badge cloud, with wrapping and spacing */}
              <div className="flex flex-wrap gap-2">
                {team.members.map((member, i) => (
                  <MemberName key={i} member={member} />
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* --- End Team Sections --- */}

      </div>
    </div>
  );
};

export default TeamDirectory;