// src/components/CombinedForm/index.js

import CombinedForm from "./CombinedForm.jsx";
export default CombinedForm;

// (Optional) Named exports — if you want direct access to logic or helpers elsewhere:
export { useCombinedFormLogic } from "./hooks/useCombinedFormLogic";

// Handlers (optional)
export { handleFinish } from "./handlers/handleFinish";
export { handleJoinFamily } from "./handlers/handleJoinFamily";
export { enterEditMode } from "./handlers/enterEditMode";
export { handleEditorApproval } from "./handlers/handleEditorApproval";

// Utils (optional)
export { handleUpdateFamily, toggleMemberPendingStatus } from "./utils/familyHelpers";
export { loadLocalProfile, saveLocalProfile } from "./utils/localforageHelpers";
