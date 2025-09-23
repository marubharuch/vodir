
// HomePage.jsx
import { useAuth } from "../context/AuthContext";
import CombinedForm from "../components/CombinedForm";
import { useProfile } from "../context/ProfileContext";

const HomePage = () => {
  const { user, logout } = useAuth();
  const { profile } = useProfile();

  //const [showForm, setShowForm] = useState(false);

  if (!user) return <div>Please log in.</div>;
//console.log(profile.members)
  return (
    <div className="p-4">
      <h1>Welcome, {user.email} 🎉</h1>

      {profile ? (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <p><strong>Native City:</strong> {profile.nativeCity}</p>
          <p><strong>Current City:</strong> {profile.currentCity}</p>
          <p><strong>Members:</strong> {profile.members?.length || 0}</p>
        </div>
      ) : (
        <>
        <p className="text-gray-600 mb-4">No profile saved yet. Add your details below.</p>

        <CombinedForm />
</>
      )}

      
      <button
        onClick={logout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default HomePage;




//===== old page with carousel ribine etc

{/*import React from 'react';
import CityRibbon from '../components/CityRibbon';
import Carousel from '../components/Carousel';
import CardList from '../components/CardList';
import { images, cards } from '../data/carouselData';
const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <CityRibbon/>
      
    <Carousel images={images} />
    <CardList cards={cards} />
  


  </div>
  );
};

export default HomePage;*/}
