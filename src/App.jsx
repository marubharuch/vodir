import { useState } from 'react'


function App() {
  const [count, setCount] = useState(0)

  return (
   
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
            <div className="shrink-0">
              <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-medium text-black">Tailwind CSS Test</div>
              <p className="text-gray-500">If you see a blue circle with a checkmark, Tailwind is working! 🎉</p>
            </div>
          </div>
        </div>
      );
    };
    
  

export default App
