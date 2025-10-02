/* src/pages/HomePage.jsx
Start
  |
  v
Check user from AuthContext
  |
  v
Is user undefined? ---- Yes ----> Show "Loading..."
  |                                ^
  No                               |
  |                                |
  v                                |
Is user null? -------- Yes -------> Show "You are not logged in"
  |
  No
  |
  v
Show Welcome Header + Logout Button
  |
  v
Show CityRibbon
  |
  v
Render CombinedForm (handles profile display/edit logic)
  |
  v
End



*/
// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";   // Remark: AuthContext se user aur logout function aa raha hai
import { useProfile } from "../context/ProfileContext"; // Remark: ProfileContext se user ka profile aa raha hai
import CombinedForm from "../components/CombinedForm";
import CityRibbon from "../components/CityRibbon";
import Carousel from "../components/Carousel";
import CardList from "../components/CardList";
import { images, cards } from "../data/carouselData";


const HomePage = () => {
  const { user, logout } = useAuth();
  const { profile } = useProfile();   // Remark: Profile used ho raha hai future customization ke liye
  const [loading, setLoading] = useState(true);

  // Remark: Ye effect ensure karta hai ki jab tak user state initialize nahi hoti, tab tak "Loading" dikhe
  useEffect(() => {
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  if (!user)
    return (
      <div className="p-6 text-center text-red-500">
        You are not logged in.
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* --- Top greeting + logout --- */}
      <div className="p-4 bg-white shadow-md flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">
          Welcome, {user.displayName || user.email} 🎉
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* --- Ribbon --- */}
      <CityRibbon />   {/* Remark: Ye component ek city ribbon UI dikhata hai */}
      
      {/* --- Optional components --- */}
      {/* <Carousel images={images} />  // Remark: Carousel abhi comment out hai, user ke liye images slide show ke liye use hota hoga */}
      {/* <CardList cards={cards} />   // Remark: Card list UI ke liye optional hai */}

      {/* --- Profile Section --- */}
      <div className="p-4">
        {/* Remark: CombinedForm hamesha render hota hai. Usme apna logic hai 
            ki view mode, edit mode ya form kaise dikhana hai */}
        <CombinedForm />
      </div>
    </div>
  );
};

export default HomePage;
