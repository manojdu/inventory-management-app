import React, { useState } from 'react'
import { Modal, Box, TextField, Button, Typography, Alert } from '@mui/material'
import { signUp, signIn, signInWithGoogle } from './auth'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
}

const AuthModal = ({ open, onClose, setUser }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async () => {
    try {
      let user
      if (isSignUp) {
        user = await signUp(email, password, name)
      } else {
        user = await signIn(email, password)
      }
      onClose(user)
    } catch (error) {
      console.error('Authentication error:', error)
      setError(error.message)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle()
      onClose(user)
    } catch (error) {
      console.error('Google sign-in error:', error)
      setError(error.message)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => onClose(null)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {isSignUp && (
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleAuth}
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 1, mb: 2 }}
          onClick={handleGoogleSignIn}
        >
          Sign In with Google
        </Button>
        <Button
          fullWidth
          variant="text"
          sx={{ mt: 1, mb: 2 }}
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Button>
      </Box>
    </Modal>
  )
}

export default AuthModal