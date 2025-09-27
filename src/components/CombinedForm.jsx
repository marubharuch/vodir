import React, { useState, useEffect } from "react";
import { useProfile } from "../context/ProfileContext";
import { datastore } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const CombinedForm = () => {
  const { profile, updateProfile } = useProfile();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    nativeCity: "",
    currentCity: "",
    gender: "",
    name: "",
    countryCode: "+91",
    mobile: "",
  });
  const [joinPin, setJoinPin] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 👉 સ્માર્ટ ડેટા લોડિંગ: લોકલ, પછી ફાયરસ્ટોર
  useEffect(() => {
    const fetchFamilyProfile = async () => {
      if (profile) {
        setFormData((s) => ({
          ...s,
          nativeCity: profile.nativeCity || "",
          currentCity: profile.currentCity || "",
        }));
        setMembers(profile.members || []);
        setJoinPin(profile.pin || "");
        setIsEditing(true);
        return;
      }

      if (user?.uid) {
        setLoading(true);
        try {
          const familiesRef = collection(datastore, "families");
          
          // FIX: આખું families કલેક્શન મેળવીને પછી લોકલી ફિલ્ટર કરો
          const querySnapshot = await getDocs(familiesRef);

          let foundFamily = null;
          querySnapshot.forEach((doc) => {
            const familyData = doc.data();
            const isMember = familyData.members.some(
              (member) => member.userId === user.uid
            );
            if (isMember) {
              foundFamily = { ...familyData, id: doc.id };
            }
          });

          if (foundFamily) {
            updateProfile(foundFamily);
            setMembers(foundFamily.members || []);
            setJoinPin(foundFamily.pin || "");
            setIsEditing(true);
            setWarning("✅ તમારો ફેમિલી ડેટા સિંક થઈ ગયો છે!");
          } else {
            setIsEditing(false);
            setWarning(
              "⚠️ તમારા માટે કોઈ ફેમિલી ડેટા મળ્યો નથી. કૃપા કરીને નવી ફેમિલી બનાવો."
            );
          }
        } catch (err) {
          setWarning("⚠️ ડેટા મેળવવામાં ભૂલ થઈ. ફરી પ્રયાસ કરો.");
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFamilyProfile();
  }, [profile, user, updateProfile]);

  const canAdd =
    formData.gender &&
    formData.name.trim() &&
    formData.countryCode.startsWith("+") &&
    formData.mobile.trim();

  // 👉 સભ્ય ઉમેરો અથવા અપડેટ કરો
  const handleAdd = () => {
    if (!formData.nativeCity.trim() || !formData.currentCity.trim()) {
      setWarning("⚠️ કૃપા કરીને પહેલા વતન અને હાલનું શહેર ભરો.");
      return;
    }
    if (!canAdd) {
      setWarning("⚠️ કૃપા કરીને સભ્યની તમામ વિગતો ભરો.");
      return;
    }
    setWarning("");

    if (editingId) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? {
                ...m,
                gender: formData.gender,
                name: formData.name.trim(),
                countryCode: formData.countryCode,
                mobile: formData.mobile,
              }
            : m
        )
      );
      setEditingId(null);
    } else {
      setMembers((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          userId: user.uid,
          gender: formData.gender,
          name: formData.name.trim(),
          countryCode: formData.countryCode,
          mobile: formData.mobile,
        },
      ]);
    }

    setFormData((s) => ({
      ...s,
      gender: "",
      name: "",
      countryCode: "+91",
      mobile: "",
    }));
  };

  // 👉 ફેમિલી બનાવો અથવા જોડાઓ
  const handleFinish = async () => {
    setLoading(true);
    setWarning("");
    // FIX: જો formData માં ડેટા હોય અને તે કોઈ સભ્યનો ન હોય તો તેને members માં ઉમેરો.
    if (canAdd && !editingId) {
        setMembers((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                userId: user.uid,
                gender: formData.gender,
                name: formData.name.trim(),
                countryCode: formData.countryCode,
                mobile: formData.mobile,
            },
        ]);
    }

    // હવે members એરેની લંબાઈ તપાસો, કારણ કે ઉપર નવો ડેટા ઉમેરાઈ ગયો હશે.
    if (members.length === 0 && !joinPin.trim() && !(canAdd && !editingId)) {
        setWarning("⚠️ ફેમિલી બનાવવા માટે કૃપા કરીને ઓછામાં ઓછો એક સભ્ય ઉમેરો.");
        setLoading(false);
        return;
    }


    try {
      // કેસ 1: હાલની ફેમિલીમાં જોડાઓ
      if (joinPin.trim() && !profile?.id) {
        const familiesRef = collection(datastore, "families");
        const q = query(familiesRef, where("pin", "==", joinPin));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const existingData = docSnap.data();

          const newMembers = [...existingData.members];
          const newMemberData = {
            id: crypto.randomUUID(),
            userId: user.uid,
            gender: formData.gender,
            name: formData.name.trim(),
            countryCode: formData.countryCode,
            mobile: formData.mobile,
          };

          const existingMemberIndex = newMembers.findIndex(
            (m) => m.mobile === newMemberData.mobile && m.countryCode === newMemberData.countryCode
          );

          if (existingMemberIndex > -1) {
            newMembers[existingMemberIndex].userId = newMemberData.userId;
            newMembers[existingMemberIndex].name = newMemberData.name;
          } else {
            newMembers.push(newMemberData);
          }

          const familyDocRef = doc(datastore, "families", docSnap.id);
          await updateDoc(familyDocRef, {
            members: newMembers,
            updatedAt: serverTimestamp(),
          });

          updateProfile({
            ...existingData,
            members: newMembers,
            id: docSnap.id,
            pin: joinPin,
          });
          alert("✅ ફેમિલીમાં સફળતાપૂર્વક જોડાયા!");
        } else {
          setWarning("⚠️ અમાન્ય PIN. ફેમિલી મળી નથી.");
        }
      }
      // કેસ 2: નવી ફેમિલી બનાવો અથવા અપડેટ કરો
      else {
        if (members.length === 0) {
          setWarning("⚠️ કૃપા કરીને ઓછામાં ઓછો એક સભ્ય ઉમેરો.");
          return;
        }

        if (profile?.id) {
          // અપડેટ કરો
          const familyDocRef = doc(datastore, "families", profile.id);
          await updateDoc(familyDocRef, {
            nativeCity: formData.nativeCity,
            currentCity: formData.currentCity,
            members: members,
            updatedAt: serverTimestamp(),
          });
          updateProfile({ ...profile, nativeCity: formData.nativeCity, currentCity: formData.currentCity, members: members });
          setWarning("✅ ફેમિલી ડેટા સફળતાપૂર્વક અપડેટ થયો!");
        } else {
          // બનાવો
          const pin = Math.floor(1000 + Math.random() * 9000).toString();
          const familyPayload = {
            pin,
            nativeCity: formData.nativeCity,
            currentCity: formData.currentCity,
            createdBy: user.uid,
            members: members, // FIX: અહીં મેમ્બર્સ એરે સીધો ઉપયોગ કરો, નવો id ન આપો
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          const familyDocRef = doc(collection(datastore, "families"));
          await setDoc(familyDocRef, familyPayload);
          updateProfile({ ...familyPayload, id: familyDocRef.id });
          setJoinPin(pin);
          alert(`✅ ફેમિલી બનાવવામાં આવી! તમારો PIN છે: ${pin}`);
        }
      }
      setIsEditing(true);
    } catch (err) {
      setWarning(`⚠️ ભૂલ થઈ. ફરી પ્રયાસ કરો.`);
      console.error("Firebase error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startEditMember = (id) => {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    setEditingId(id);
    setFormData({
      ...formData,
      gender: m.gender,
      name: m.name,
      countryCode: m.countryCode,
      mobile: m.mobile,
    });
  };

  const deleteMember = (id) => {
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
  };

  // 👉 ડેટા સિંક
  const handleDataSync = async () => {
    if (!profile?.id) {
      setWarning("⚠️ સંપાદન માટે કોઈ પ્રોફાઇલ ઉપલબ્ધ નથી.");
      return;
    }
    setLoading(true);
    try {
      const docRef = doc(datastore, "families", profile.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        updateProfile({ ...firestoreData, id: profile.id });
        setMembers(firestoreData.members || []);
        setFormData((s) => ({
          ...s,
          nativeCity: firestoreData.nativeCity,
          currentCity: firestoreData.currentCity,
        }));
        setWarning("✅ ડેટા સફળતાપૂર્વક સિંક થયો!");
      } else {
        setWarning("⚠️ ફેમિલી ડેટા ફાયરસ્ટોરમાં મળ્યો નથી.");
      }
    } catch (err) {
      setWarning("⚠️ ડેટા સિંક કરવામાં ભૂલ થઈ. ફરી પ્રયાસ કરો.");
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      {profile && !editingId && (
        <button
          onClick={handleDataSync}
          className="bg-blue-600 text-white px-4 py-2 rounded-md mb-4"
          disabled={loading}
        >
          {loading ? "સિંક થઈ રહ્યું છે..." : "✏️ ડેટા સિંક કરો અને સંપાદિત કરો"}
        </button>
      )}

      {(!profile || isEditing) && (
        <>
          <h2 className="text-lg font-bold">🏠 શહેરની માહિતી</h2>
          <input
            type="text"
            placeholder="વતન શહેર"
            value={formData.nativeCity}
            onChange={(e) =>
              setFormData({ ...formData, nativeCity: e.target.value })
            }
            className="border p-1 m-1"
          />
          <input
            type="text"
            placeholder="હાલનું શહેર"
            value={formData.currentCity}
            onChange={(e) =>
              setFormData({ ...formData, currentCity: e.target.value })
            }
            className="border p-1 m-1"
          />

          {!profile && (
            <div className="mb-2">
              <input
                type="text"
                placeholder="ફેમિલી PIN દાખલ કરો"
                value={joinPin}
                onChange={(e) => setJoinPin(e.target.value)}
                className="border p-1 w-48"
              />
            </div>
          )}

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

          <div className="mt-3 border p-3 rounded">
            <h2 className="text-lg font-bold">📝 સભ્યની વિગતો</h2>
            <div className="flex gap-2 my-2 w-full max-w-full">
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="border p-1 w-1/5"
              >
                <option value="">M/F</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="text"
                value={formData.countryCode}
                onChange={(e) =>
                  setFormData({ ...formData, countryCode: e.target.value })
                }
                className="border p-1 w-16 flex-shrink-0"
              />
              <input
                type="text"
                placeholder="મોબાઇલ"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                className="border p-1 flex-1 min-w-0"
              />
            </div>
            <input
              type="text"
              placeholder="નામ"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border p-1 w-full my-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="bg-green-500 text-white px-3 py-2 rounded"
              >
                {editingId ? "અપડેટ" : "ઉમેરો"}
              </button>
              <button
                onClick={handleFinish}
                className="bg-blue-500 text-white px-3 py-2 rounded"
              >
                {profile?.id
                  ? "ડેટા સેવ કરો"
                  : joinPin.trim()
                  ? "ફેમિલીમાં જોડાઓ"
                  : "ફેમિલી બનાવો"}
              </button>
            </div>
          </div>
        </>
      )}

      {warning && <p className="text-red-500 mt-2">{warning}</p>}
    </div>
  );
};

export default CombinedForm;