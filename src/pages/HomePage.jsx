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
import TeamDirectory from "./TeamDirectory";


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
    <div className="flex flex-col min-h-screen bg-gray-50 pb-2">
  {/* --- Ribbon --- */}
      <CityRibbon />   {/* Remark: Ye component ek city ribbon UI dikhata hai */}
      

      {/* --- Top greeting + logout --- */}
      <div className="p-2 bg-white shadow-md flex items-center justify-between">
        
      
       {/* <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>*/
}      </div>

   <div className="text-center px-1 py-1 sm:px-6 sm:py-4 bg-white rounded-lg shadow-sm">
  <h5 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
    Welcome, {user?.displayName || user?.email} 🎉
  </h5>

 <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-1">
    સમાજની ડિરેક્ટરીને સાચી અને અપડેટેડ રાખવું દરેક સભ્યની જવાબદારી છે.
    આપના સહયોગ અને સક્રિય ભાગીદારી બદલ આભાર.
    </p>

 <hr class="my-1 h-px bg-gray-300 border-0 dark:bg-gray-700"></hr>
  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
  

પ્રથમ તબક્કામાં, આપણે ટેલિફોન/મોબાઇલ ડિરેક્ટરી બનાવી રહ્યા છીએ.

Please તમારા પરિવારના દરેક સભ્યનું નામ અને મોબાઇલ નંબર ઉમેરો.
  </p>



    <hr class="my-1 h-px bg-gray-300 border-0 dark:bg-gray-700"></hr>
   
   
   
    <p>
    {/* ✅ New Gujarati Instruction */}
    આપના પરિવારનો ડેટા અપડેટ કરવા માટે જમણી બાજુના નીચેના ખૂણામાં **'ફેમિલી'** બટન પર ક્લિક કરો.
  </p>


  {/*<p className="text-sm sm:text-base text-gray-600 leading-relaxed">
    Keeping the community directory accurate and updated is a shared
    responsibility. Thank you for your support and active participation.
    </p>
   <hr class="my-8 h-px bg-gray-300 border-0 dark:bg-gray-700"></hr>
    <p>
    {/* ✅ New English Instruction 
    Please click on the **'Family'** button in the bottom right corner to update your family data.
  </p>*/}

</div>


      {/* --- Optional components --- */}
      {/* <Carousel images={images} />  // Remark: Carousel abhi comment out hai, user ke liye images slide show ke liye use hota hoga */}
      {/* <CardList cards={cards} />   // Remark: Card list UI ke liye optional hai */}

      {/* --- Profile Section --- */}


      <div className="p-4">
        {/* Remark: CombinedForm hamesha render hota hai. Usme apna logic hai 
            ki view mode, edit mode ya form kaise dikhana hai */}
      { /* <CombinedForm />*/}
      <TeamDirectory/>
      </div>
    </div>
  );
};

export default HomePage;
