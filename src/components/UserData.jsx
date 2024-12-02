import { useState } from 'react'
import { constants } from '../utils/constants'
import { toast } from 'react-toastify'

const UserData = ({ usersData, setRefresh }) => {
	const [formData, setFormData] = useState({
		user: '',
		pass: ''
	})
	const [isEditing, setIsEditing] = useState(false)
	const [selectedUser, setSelectedUser] = useState(null)

	function handleInputChange(e) {
		const { name, value } = e.target

		setFormData(prevData => ({
			...prevData,
			[name]: value
		}))
	}

	const handleClearForm = () => {
		setFormData({ user: '', pass: '' })
	}

	const handleCreate = async e => {
		e.preventDefault()
		try {
			const response = await fetch(`${constants.serverIp}/api/device/user`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					user: formData.user,
					pass: formData.pass
				})
			})

			const result = await response.json()

			if (response.ok) {
				toast.success(`${result.message}`)
				setRefresh(counter => counter + 1)
				// Дополнительная логика, например, очистка формы или обновление списка пользователей
				setFormData({ user: '', pass: '' })
			} else {
				toast.error(`Error creating user:${result.message}`)
			}
		} catch (error) {
			console.error('Network error:', error)
			toast.error('Network error occurred')
		}
	}

	const handleEdit = userToEdit => {
		setIsEditing(true)
		setSelectedUser(userToEdit)
		setFormData({ user: userToEdit, pass: '' })
	}

	const handleCancelEdit = () => {
		handleClearForm()
		setIsEditing(false)
		setSelectedUser(null)
	}

	const handleUpdate = async e => {
		e.preventDefault()
		try {
			const response = await fetch(`${constants.serverIp}/api/device/user`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					user: formData.user,
					pass: formData.pass
				})
			})

			const result = await response.json()

			if (response.ok) {
				toast.success(`${result.message}`)
				setRefresh(counter => counter + 1)
				handleCancelEdit()
			} else {
				toast.error(`Error updating user:${result.message}`)
			}
		} catch (error) {
			console.error('Network error:', error)
			toast.error('Network error occurred')
		}
	}

	const handleDelete = async userToDelete => {
		if (isEditing) {
			handleCancelEdit()
		}
		try {
			const response = await fetch(`${constants.serverIp}/api/device/user`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					user: userToDelete
				})
			})

			const result = await response.json()
			if (response.ok) {
				toast.success('User deleted successfully:', result)
				setRefresh(counter => counter + 1)
			} else {
				toast.error('Error deleting user:', result.message)
			}
		} catch (error) {
			console.error('Network error:', error)
			toast.error('Network error occurred')
		}
	}

	const Card = ({ title, data }) => {
		return (
			<div className='col-md-6'>
				<div className='card h-100'>
					<div className='card-header'>
						<h5 className='card-title'>{title}</h5>
					</div>
					<div className='card-body'>
						<ul className='list-group h-100'>
							{data.map((user, index) => (
								<li
									key={index}
									className='list-group-item d-flex justify-content-between align-items-center'
								>
									<span>
										{Object.entries(user).map(([key, value]) => (
											<span key={key}>
												<strong>{key}:</strong> {value}{' '}
											</span>
										))}
									</span>
									<div>
										<button
											type='button'
											className='btn btn-outline-dark btn-sm me-2'
											onClick={() => handleEdit(data[index].user)}
										>
											Edit
										</button>
										<button
											disabled={index == 0}
											type='button'
											className='btn btn-outline-danger btn-sm'
											onClick={() => handleDelete(data[index].user)}
										>
											Delete
										</button>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='col-md-8 mt-4 d-flex flex-column'>
			<h2 className='mb-4'>User Management</h2>
			<div className='row h-100'>
				{usersData && <Card title='User List' data={usersData.users} />}

				<div className='col-md-6'>
					<div className='card h-100'>
						{!isEditing && (
							<div className='card-header'>
								<h5 className='card-title'>Add New User</h5>
							</div>
						)}
						{isEditing && (
							<div className='card-header'>
								<h5 className='card-title'>Edit User: {selectedUser}</h5>
							</div>
						)}
						<div className='card-body'>
							<form
								onSubmit={isEditing ? handleUpdate : handleCreate}
								className='d-flex h-100 flex-column justify-content-around'
							>
								<div className='mb-3 d-flex h-100 flex-column justify-content-around'>
									<label className='form-label'>
										<strong>username</strong>
									</label>
									<input
										required
										className='form-control'
										type='text'
										name='user'
										disabled={isEditing}
										placeholder='enter user name'
										value={formData.user}
										onChange={handleInputChange}
									/>
								</div>
								<div className='mb-3 d-flex h-100 flex-column justify-content-around'>
									<label className='form-label'>
										<strong>password</strong>
									</label>
									<input
										required
										className='form-control'
										type='password'
										name='pass'
										placeholder={
											isEditing ? 'enter new password' : 'enter password'
										}
										value={formData.pass}
										onChange={handleInputChange}
									/>
								</div>
								{!isEditing && (
									<div className='d-flex h-100 flex-column justify-content-around'>
										<button
											type='submit'
											// onClick={handleCreate}
											className='btn btn-outline-dark'
										>
											<strong>Create user</strong>
										</button>
										<button
											type='button'
											onClick={handleClearForm}
											className='btn btn-outline-danger mt-3'
										>
											<strong>Clear form</strong>
										</button>
									</div>
								)}
								{isEditing && (
									<div className='d-flex h-100 flex-column justify-content-around'>
										<button
											type='submit'
											// onClick={handleUpdate}
											className='btn btn-outline-dark'
										>
											<strong>Save changes</strong>
										</button>
										<button
											type='button'
											onClick={handleCancelEdit}
											className='btn btn-outline-danger mt-3'
										>
											<strong>Cancel edit</strong>
										</button>
									</div>
								)}
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default UserData
