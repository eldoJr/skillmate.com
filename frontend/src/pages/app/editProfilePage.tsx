import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function EditProfilePage() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/app/profile', { replace: true }) }, [navigate])
  return null
}
