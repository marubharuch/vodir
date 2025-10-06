import React from 'react';

const teamData = [
  {
    teamName: "Oswal Coders 💻",
    members: [
      "Sanjay Shah",
      "Virang Mehta",
      "Jainam Shah",
      "Dipen Shah",
      "Kalp Shah",
      "Tirth Shah",
      "Jay Shah",
      "Utsav Shah ",
      "Jinal Shah",
      "Hetavi Shah"
    ],
  },
  {
    teamName: "Oswal Connectors 🤝",
    members: [
      // Please replace these placeholders with the actual names
      { name: "Connector A", remark: "(Outreach)" },
      { name: "Connector B", remark: "(Verification)" },
      { name: "Connector C", remark: "(Support)" },
      { name: "Connector D", remark: "(Inspiration)" },
    ],
  },
];

// Helper component for a single member display
const MemberName = ({ member }) => {
    const isObject = typeof member === 'object';
    const name = isObject ? member.name : member;
    const remark = isObject ? member.remark : null;

    return (
        // Minimal styling: just horizontal padding and text size
        <div className="px-1 py-1 text-base text-gray-700 whitespace-nowrap">
            <span className="font-normal">{name}</span>
            {remark && (
                <span className="text-sm text-gray-500 ml-1">{remark}</span>
            )}
        </div>
    );
};

// Main Team Directory Component
const TeamDirectory = () => {
  return (
    <div className="min-h-screen p-1 sm:p-1">
      <div className="max-w-4xl mx-auto">
        
        {/* Main Title 
        <h1 className="text-l font-bold text-center text-gray-900 mb-1">
          Project Teams
        </h1>*/}

        {/* --- Team Sections --- */}
        {teamData.map((team, index) => (
          <div 
            key={index} 
            className="mb-1" // Simple bottom margin for separation
          >
            
            {/* Team Title - Centered, slightly smaller and underlined for separation */}
        {  /*  <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6 border-b border-gray-300 pb-1 inline-block mx-auto">
              {team.teamName}
            </h2>*/}
            
            {/* Centering the H2 via inline-block and margin auto is tricky without a wrapping div, 
                so we'll use a container just for the title if needed, but for simplicity we keep it centered.
                A simple <p> for centering works well here: */}
            <p className="text-center">
                {team.teamName}
            </p>

            {/* Member List - Centered and Wrapping */}
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-2">
              {team.members.map((member, i) => (
                <MemberName key={i} member={member} />
              ))}
            </div>
             <hr class="my-1 h-px bg-gray-300 border-0 dark:bg-gray-700"></hr>
          </div>
        ))}
        {/* --- End Team Sections --- */}

      </div>
    </div>
  );
};

export default TeamDirectory;