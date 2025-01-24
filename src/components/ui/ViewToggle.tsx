import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'

const ViewToggle = () => {
  const { viewMode, toggleViewMode, profile } = useAuth()
  const [isAnimating, setIsAnimating] = useState(false)

  // Only show toggle for coaches/admins
  if (!profile?.role || (profile.role !== 'coach' && profile.role !== 'super_admin')) {
    return null
  }

  const handleToggle = async () => {
    setIsAnimating(true)
    await toggleViewMode()
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <div className="px-4 py-3 mb-3 border-b border-[#3A3B3C]">
      <button
        onClick={handleToggle}
        disabled={isAnimating}
        className={`
          w-full px-4 py-3 rounded-lg 
          flex items-center justify-between
          transition-colors duration-200
          ${viewMode === 'coach' 
            ? 'bg-[#3A3B3C] text-[#00A3E0]' 
            : 'bg-[#18191A] text-gray-300'
          }
          hover:bg-[#3A3B3C]
        `}
      >
        <span className="text-sm font-medium">
          {viewMode === 'coach' ? 'Coach View' : 'Athlete View'}
        </span>
        
        <motion.div
          animate={{ 
            rotate: viewMode === 'coach' ? 0 : 180,
            scale: isAnimating ? 0.9 : 1
          }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4"
        >
          ⟳
        </motion.div>
      </button>
    </div>
  )
}

export default ViewToggle