import { useEffect, useState } from 'react'
import { constants } from '../utils/constants'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const AuthForm = ({ setAuthUser }) => {
	const [formData, setFormData] = useState({
		username: '',
		password: ''
	})

	function handleInputChange(event) {
		const { name, value } = event.target
		setFormData(prevState => ({
			...prevState,
			[name]: value
		}))
	}
	// async function handleSignUp() {
	// 	toast.info('Sign up feature is under development.')
	// }

	useEffect(() => {
		const formElement = document.querySelector('form')
		const handleKeyDown = event => {
			if (event.key === 'Enter') {
				handleLogIn()
			}
		}
		formElement.addEventListener('keydown', handleKeyDown)

		return () => {
			formElement.removeEventListener('keydown', handleKeyDown)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formData])

	async function handleLogIn() {
		if (!formData.username || !formData.password) {
			toast.error('Please fill in both username and password.')
			return
		}
		const toBase64UTF8 = str =>
			btoa(String.fromCharCode(...new TextEncoder().encode(str)))
		const credentials = toBase64UTF8(
			`${formData.username}:${formData.password}`
		)
		try {
			const response = await fetch(`${constants.serverIp}/api/login`, {
				method: 'POST',
				headers: {
					Authorization: `Basic ${credentials}`
				},
				credentials: 'include'
			})
			if (!response.ok) {
				throw new Error(
					`Login failed: ${response.status} ${response.statusText}`
				)
			}
			const result = await response.json()
			setAuthUser(result.user)
			toast.clearWaitingQueue()
			toast.dismiss()
		} catch (error) {
			console.error('Error during login:', error)
			toast.error('Login failed. Please try again.')
		}
	}

	return (
		<div className='col-md-6 col-12'>
			<div className='card flex-grow-1'>
				<div className='card-header'>
					<h5 className='card-title'>Login Form</h5>
				</div>
				<div className='card-body d-flex'>
					<form className='d-flex flex-column flex-grow-1 justify-content-between'>
						<div className='mb-3'>
							<label className='form-label'>
								<strong>Username</strong>
							</label>
							<input
								className='form-control'
								type='text'
								name='username'
								value={formData.username}
								placeholder='Enter username'
								onChange={handleInputChange}
							/>
						</div>
						<div className='mb-3'>
							<label className='form-label'>
								<strong>Password</strong>
							</label>
							<input
								className='form-control'
								type='password'
								name='password'
								value={formData.password}
								placeholder='Enter password'
								onChange={handleInputChange}
							/>
						</div>
						<div className='d-flex flex-column gap-3'>
							<button
								type='button'
								onClick={handleLogIn}
								className='btn btn-outline-dark'
							>
								<strong>Log in</strong>
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default AuthForm
