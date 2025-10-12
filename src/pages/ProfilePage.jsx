import React from "react";
import CombinedForm from "../components/CombinedForm/CombinedForm";
//import CombinedForm from "@/components/CombinedForm";

import { useProfile } from "../context/ProfileContext";

const ProfilePage = () => {
  const { profile } = useProfile();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">👤 Family Profile</h1>

      {/* Show saved profile summary (if any) */}
      {profile ? (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <p><strong>Native City:</strong> {profile.nativeCity}</p>
          <p><strong>Current City:</strong> {profile.currentCity}</p>
          <p><strong>Members:</strong> {profile.members?.length || 0}</p>
        </div>
      ) : (
        <p className="text-gray-600 mb-4">No profile saved yet. Add your details below.</p>
      )}

      {/* Combined Form for add/edit */}
      <CombinedForm />
    </div>
  );
};

export default ProfilePage;
