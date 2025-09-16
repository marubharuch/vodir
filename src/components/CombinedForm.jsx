import React, { useMemo, useState } from "react";

const CombinedForm = () => {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    nativeCity: "",
    currentCity: "",
    gender: "",
    name: "",
    countryCode: "+91",
    mobile: ""
  });
  const [warning, setWarning] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // Finish state
  const [finalized, setFinalized] = useState(false);

  // City lock (after first Add or Finish); can be unlocked with Edit Cities
  const [cityLocked, setCityLocked] = useState(false);

  // Editing state for chips
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    gender: "",
    name: "",
    countryCode: "+91",
    mobile: ""
  });

  const englishOnly = (text) => /^[\x00-\x7F]*$/.test(text);

  const handleText = (e) => {
    const { name, value } = e.target;
    if (!englishOnly(value)) {
      setWarning("⚠️ Only English characters are allowed.");
      return;
    }
    setWarning("");
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleCountryCode = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
    const val = "+" + (digits || "91");
    setFormData((s) => ({ ...s, countryCode: val }));
  };

  const handleMobile = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 15);
    setFormData((s) => ({ ...s, mobile: digits }));
  };

  const startVoiceInput = () => {
    const rec = new window.webkitSpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (ev) => {
      const t = ev.results[0][0].transcript.trim();
      if (!englishOnly(t)) {
        setWarning("⚠️ Only English characters are allowed in name.");
        return;
      }
      setWarning("");
      setFormData((s) => ({ ...s, name: t }));
    };
    rec.onerror = (ev) => {
      setWarning("🎤 Voice input error: " + ev.error);
      setIsListening(false);
    };
    rec.start();
  };

  const canAdd = useMemo(() => {
    return (
      formData.gender &&
      formData.name.trim().length > 0 &&
      formData.countryCode.startsWith("+") &&
      formData.mobile.trim().length >= 8
    );
  }, [formData]);

  const handleAdd = () => {
    if (!canAdd) {
      setWarning("Please complete Gender, Name, Country Code, and Mobile.");
      return;
    }
    setWarning("");
    setMembers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        gender: formData.gender,
        name: formData.name.trim(),
        countryCode: formData.countryCode,
        mobile: formData.mobile
      }
    ]);
    setCityLocked(true); // lock cities after first add
  
    setFormData((s) => ({
      ...s,
      gender: "",
      name: "",
      countryCode: "+91",
      mobile: ""
    }));
  };

  const handleFinish = () => {
    const hasPendingMember =
      formData.gender &&
      formData.name.trim() &&
      formData.countryCode.startsWith("+") &&
      formData.mobile.trim();
  
    if (hasPendingMember) {
      setMembers((prev) => [
        ...prev,
        {
          id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
          gender: formData.gender,
          name: formData.name.trim(),
          countryCode: formData.countryCode,
          mobile: formData.mobile
        }
      ]);
    }
  
    const payload = {
      nativeCity: formData.nativeCity,
      currentCity: formData.currentCity,
      members: hasPendingMember
        ? [
            ...members,
            {
              id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
              gender: formData.gender,
              name: formData.name.trim(),
              countryCode: formData.countryCode,
              mobile: formData.mobile
            }
          ]
        : members
    };
  
    localStorage.setItem("familyData", JSON.stringify(payload));
    setCityLocked(true);
    setFinalized(true);
    setShowForm(false);
    setWarning("");
    alert("✅ Last member added and data saved to localStorage!");
  };
  

  // Chip edit/delete
  const startEditMember = (id) => {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    setEditingId(id);
    setEditDraft({
      gender: m.gender,
      name: m.name,
      countryCode: m.countryCode,
      mobile: m.mobile
    });
  };

  const cancelEditMember = () => {
    setEditingId(null);
    setEditDraft({ gender: "", name: "", countryCode: "+91", mobile: "" });
  };

  const saveEditMember = () => {
    if (
      !editDraft.gender ||
      !editDraft.name.trim() ||
      !editDraft.countryCode.startsWith("+") ||
      !editDraft.mobile.trim()
    ) {
      setWarning("Please complete Gender, Name, Country Code, and Mobile for this member.");
      return;
    }
    setMembers((prev) =>
      prev.map((m) =>
        m.id === editingId
          ? {
              ...m,
              gender: editDraft.gender,
              name: editDraft.name.trim(),
              countryCode: editDraft.countryCode,
              mobile: editDraft.mobile
            }
          : m
      )
    );
    setWarning("");
    cancelEditMember();
  };

  const deleteMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (editingId === id) cancelEditMember();
  };

  // Edit draft handlers
  const handleEditDraftText = (e) => {
    const { name, value } = e.target;
    if (!englishOnly(value)) {
      setWarning("⚠️ Only English characters are allowed.");
      return;
    }
    setWarning("");
    setEditDraft((s) => ({ ...s, [name]: value }));
  };

  const handleEditDraftCode = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
    const val = "+" + (digits || "91");
    setEditDraft((s) => ({ ...s, countryCode: val }));
  };

  const handleEditDraftMobile = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 15);
    setEditDraft((s) => ({ ...s, mobile: digits }));
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header action after finish */}
      {/*finalized && (
        <div className="mb-2 text-sm text-gray-700">
          ✅ Finished. You can still add/edit members. To edit cities, use “Edit cities”.
        </div>
      )*/}

      {/* City Info */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold mb-2">🏠 City Information</h3>
        <button
          type="button"
          className="text-sm text-blue-600 underline"
          onClick={() => setCityLocked((v) => !v)}
          title={cityLocked ? "Unlock cities for editing" : "Lock cities"}
        >
          {cityLocked ? "Edit cities" : "Lock cities"}
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        {cityLocked ? (
          <>
            <div className="flex-1 h-11 px-3 flex items-center bg-gray-100 rounded text-base">
              {formData.nativeCity || "-"}
            </div>
            <div className="flex-1 h-11 px-3 flex items-center bg-gray-100 rounded text-base">
              {formData.currentCity || "-"}
            </div>
          </>
        ) : (
          <>
            <input
              type="text"
              name="nativeCity"
              placeholder="Native City"
              value={formData.nativeCity}
              onChange={handleText}
              className="flex-1 h-11 px-3 text-base border rounded w-full"
            />
            <input
              type="text"
              name="currentCity"
              placeholder="Current City"
              value={formData.currentCity}
              onChange={handleText}
              className="flex-1 h-11 px-3 text-base border rounded w-full"
            />
          </>
        )}
      </div>

      {/* Added Members directly under City */}
      <h3 className="text-xl font-semibold mb-2">👥 Added Members</h3>
      {members.length === 0 ? (
        <div className="text-gray-500 mb-3">No members added yet.</div>
      ) : (
        <div className="mb-3 space-y-2">
          {members.map((m) => {
            const isEditing = editingId === m.id;
            return (
              <div key={m.id} className="bg-gray-100 p-3 rounded">
                {!isEditing ? (
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm">
                      <div className="font-semibold">
                        {m.gender === "male" ? "Male" : "Female"}: {m.name}
                      </div>
                      <div className="text-gray-700">
                        {m.countryCode} {m.mobile}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-2 py-1 rounded border bg-white text-sm"
                        onClick={() => startEditMember(m.id)}
                        title="Edit member"
                      >
                        ✏️ 
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded border bg-white text-sm text-red-600"
                        onClick={() => deleteMember(m.id)}
                        title="Delete member"
                      >
                        🗑️ 
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Inline editor row 1: Gender + Country code + Mobile */}
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {["male", "female"].map((g, i) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setEditDraft((s) => ({ ...s, gender: g }))}
                            className={[
                              "h-10 w-10 border flex items-center justify-center text-lg",
                              i === 0 ? "rounded-l" : "rounded-r -ml-px",
                              editDraft.gender === g ? "bg-blue-600 text-white" : "bg-white"
                            ].join(" ")}
                            aria-pressed={editDraft.gender === g}
                            aria-label={`Edit gender ${g}`}
                          >
                            {g === "male" ? "👨" : "👩"}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center border rounded w-20 h-10 px-2 bg-white">
                        <span className="mr-1">🌐</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          name="countryCode"
                          value={editDraft.countryCode}
                          onChange={handleEditDraftCode}
                          className="w-full outline-none"
                          aria-label="Country code"
                        />
                      </div>

                      <div className="flex items-center border rounded flex-grow min-w-[120px] h-10 px-2 bg-white">
                        <span className="mr-2">📱</span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          name="mobile"
                          value={editDraft.mobile}
                          onChange={handleEditDraftMobile}
                          className="w-full outline-none"
                          aria-label="Mobile number"
                        />
                      </div>
                    </div>

                    {/* Inline editor row 2: Name */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded flex-1 h-10 px-2 bg-white">
                        <span className="mr-2">
                          {editDraft.gender === "female"
                            ? "🙍‍♀️"
                            : editDraft.gender === "male"
                            ? "🙍‍♂️"
                            : "🧑"}
                        </span>
                        <input
                          type="text"
                          name="name"
                          value={editDraft.name}
                          onChange={handleEditDraftText}
                          className="w-full outline-none"
                          aria-label="Name"
                        />
                      </div>

                      <button
                        type="button"
                        className="px-3 h-10 border rounded bg-white"
                        onClick={saveEditMember}
                        title="Save member"
                      >
                        💾 
                      </button>
                      <button
                        type="button"
                        className="px-3 h-10 border rounded bg-white"
                        onClick={cancelEditMember}
                        title="Cancel edit"
                      >
                        ✖️ 
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Member Form stays as inputs even after Finish */}
      {!showForm && (
  <div className="mt-4">
    <button
      onClick={() => setShowForm(true)}
      className="w-full bg-green-600 text-white py-3 rounded text-lg"
      type="button"
    >
      ➕ Add Member
    </button>
  </div>
)}



      {showForm && (
      <>
      <h3 className="text-xl font-semibold mb-2">📝 Member Form</h3>

      {/* Gender + Country Code + Mobile in one line */}
      <div className="flex items-center gap-2 mb-3">
        {/* Segmented toggle with icons */}
        <div className="flex">
          {["male", "female"].map((g, i) => (
            <button
              key={g}
              type="button"
              onClick={() => setFormData((s) => ({ ...s, gender: g }))}
              className={[
                "h-11 w-12 border flex items-center justify-center text-xl",
                i === 0 ? "rounded-l" : "rounded-r -ml-px",
                formData.gender === g ? "bg-blue-600 text-white" : "bg-white"
              ].join(" ")}
              aria-pressed={formData.gender === g}
              aria-label={g}
            >
              {g === "male" ? "👨" : "👩"}
            </button>
          ))}
        </div>

        {/* Country Code (compact) */}
        <div className="flex items-center border rounded w-20 h-11 px-2 bg-white">
          
          <input
            type="text"
            inputMode="numeric"
            name="countryCode"
            value={formData.countryCode}
            onChange={handleCountryCode}
            className="w-full outline-none"
            aria-label="Country code"
          />
        </div>

        {/* Mobile (expanded) */}
        <div className="flex items-center border rounded flex-grow min-w-[140px] h-11 px-2 bg-white">
          <span className="mr-2">📱</span>
          <input
            type="tel"
            inputMode="numeric"
            name="mobile"
            placeholder="Mobile"
            value={formData.mobile}
            onChange={handleMobile}
            className="w-full outline-none"
            aria-label="Mobile number"
          />
        </div>
      </div>

      {/* Name + Mic */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center border rounded flex-1 h-11 px-2 bg-white">
          <span className="mr-2">
            {formData.gender === "female" ? "🙍‍♀️" : formData.gender === "male" ? "🙍‍♂️" : "🧑"}
          </span>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleText}
            className="w-full outline-none"
            aria-label="Name"
          />
        </div>
        <button
          onClick={startVoiceInput}
          disabled={isListening}
          className="px-3 h-11 border rounded bg-white"
          aria-label="Start voice input"
          title="Speak your name"
        >
          🎤 {isListening ? "Listening..." : "Speak"}
        </button>
      </div>

      {warning && <div className="text-red-600 mb-2">{warning}</div>}

{/* Action buttons: half width each, side-by-side */}
<div className="grid grid-cols-2 gap-2 mt-3">
        <button
          onClick={handleAdd}
          className="w-full bg-green-600 text-white py-3 rounded text-lg"
          type="button"
        >
          ➕ Add
        </button>
        <button
          onClick={handleFinish}
          className="w-full bg-blue-600 text-white py-3 rounded text-lg"
          type="button"
        >
          ✅ Finish
        </button>
      </div>

      </>
      )}
     
      
      {finalized && (
        <div className="mb-2 text-sm text-gray-700">
          ✅ Finished. You can still add/edit members. To edit cities, use “Edit cities”.
        </div>
      )}

    </div>
  );
};

export default CombinedForm;
