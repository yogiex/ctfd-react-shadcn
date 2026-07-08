import { useState } from 'react'
import { ChallengeBoard } from '../components/ChallengeBoard'
import { ChallengeModal } from '../components/ChallengeModal'

export function ChallengeBoardPage() {
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleChallengeSelect = (id: number) => {
    setSelectedChallengeId(id)
    setModalOpen(true)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Challenges</h1>
      </div>
      <ChallengeBoard onChallengeSelect={handleChallengeSelect} />
      <ChallengeModal
        challengeId={selectedChallengeId}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setSelectedChallengeId(null)
        }}
      />
    </>
  )
}
