// src/pages/FamilyPage.jsx
import React from "react";
import FamilyDirectory  from "../components/FamilyDirectoy";
import data from "../data/fa.json"; // adjust path if needed

export default function FamilyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <FamilyDirectory
        data={data}
        groupPhotoUrl="https://your-cdn.com/group-photo.jpg" // replace with actual photo URL
      />
    </div>
  );
}
