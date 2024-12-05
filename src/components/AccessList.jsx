import { useEffect, useState } from 'react'
import { constants } from '../utils/constants'
import { toast } from 'react-toastify'

const AccessList = () => {
	const [accessList, setAccessList] = useState(null)
	const [isEditing, setIsEditing] = useState(false)
	const [formData, setFormData] = useState({
		control: 'allow',
		ip: ''
	})

	useEffect(() => {
		fetchData()
	}, [])

	async function fetchData() {
		try {
			const response = await fetch(constants.serverIp + '/api/modbus/acl', {
				headers: {
					'Content-Type': 'text/plain'
				}
			})
			if (!response.ok) {
				throw new Error(
					`Ошибка сети: ${response.status} ${response.statusText}`
				)
			}
			const data = await response.json()
			let arrOfStr = data.access_list.split(',')
			let arrOfObj = arrOfStr.map(element => {
				return {
					control: element[0] == '+' ? 'allow' : 'forbid',
					ip: element.slice(1)
				}
			})
			setAccessList(arrOfObj)
		} catch (error) {
			// TODO  eng translation
			console.error(`Ошибка запроса:${error}`)
		}
	}

	async function sendData() {
		let access_list = accessList
			.map(obj => {
				let controlSymbol = obj.control === 'allow' ? '+' : '-' // Определяем символ по значению control
				return controlSymbol + obj.ip // Склеиваем символ и IP
			})
			.join(',') // Объединяем элементы массива в строку через запятую
		try {
			const response = await fetch(constants.serverIp + '/api/modbus/acl', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain'
				},
				body: JSON.stringify({ access_list: access_list })
			})
			const data = await response.json()
			if (!response.ok) {
				throw new Error(`message: ${data.message}`)
			}
			toast.success(JSON.stringify(data))
		} catch (error) {
			// TODO  eng translation
			toast.error(`Ошибка запроса:${error}`)
		}
	}

	function handleEdit() {
		setIsEditing(true)
	}

	function handleCancel() {
		fetchData()
		setIsEditing(false)
		setFormData({
			control: 'allow',
			ip: ''
		})
	}

	function handleSave() {
		sendData()
		fetchData()
		setIsEditing(false)
		setFormData({
			control: 'allow',
			ip: ''
		})
	}

	function handleInputChange(event) {
		const { name, value } = event.target
		setFormData(prevState => ({
			...prevState,
			[name]: value
		}))
	}

	function handleAddRule(e) {
		e.preventDefault()
		setAccessList(prevState => [...prevState, formData])
		setFormData({
			control: 'allow',
			ip: ''
		})
	}

	function deleteListElement(index) {
		setAccessList(prevAccessList =>
			prevAccessList.filter((_, i) => i !== index)
		)
	}

	function moveListElement(index, direction) {
		setAccessList(prevAccessList => {
			const newAccessList = [...prevAccessList] // Создаем копию массива

			if (direction === 'left' && index > 0) {
				// Меняем местами элементы index и index - 1
				;[newAccessList[index], newAccessList[index - 1]] = [
					newAccessList[index - 1],
					newAccessList[index]
				]
			} else if (direction === 'right' && index < newAccessList.length - 1) {
				// Меняем местами элементы index и index + 1
				;[newAccessList[index], newAccessList[index + 1]] = [
					newAccessList[index + 1],
					newAccessList[index]
				]
			}

			return newAccessList
		})
	}

	return (
		<div className='col-md-12 mt-4 d-flex flex-column'>
			<h2 className='mb-4'>Modbus Access Control</h2>
			<div className='row h-100'>
				<div className='col-md-4 '>
					<div className='card h-100 '>
						<div className='card-header'>
							<h5 className='card-title'>IP Access List</h5>
						</div>
						<div className='card-body h-100'>
							{accessList ? (
								<ul
									className='list-group'
									style={{ gap: '5px' }} // Уменьшаем расстояние между элементами
								>
									{accessList.map((rule, index) => (
										<li
											key={index}
											className='list-group-item d-flex justify-content-between align-items-center'
											style={{
												backgroundColor:
													rule.control === 'allow' ? '#d4edda' : '#f8d7da', // Светло-зеленый и светло-красный
												color: rule.control === 'allow' ? '#155724' : '#721c24' // Темно-зеленый и темно-красный
											}}
										>
											<span>
												{Object.entries(rule).map(([key, value]) => (
													<span key={key}>
														<strong>{value} </strong>
													</span>
												))}
											</span>

											<div className='d-flex '>
												{index > 0 && (
													<button
														disabled={!isEditing}
														type='button'
														className='btn btn-sm btn-outline-dark'
														// style={{
														// 	width: '20px', // Фиксированная ширина
														// 	height: '20px', // Фиксированная высота
														// 	fontSize: '1.2rem', // Уменьшенный размер текста
														// 	display: 'flex', // Центровка содержимого кнопки
														// 	alignItems: 'center',
														// 	justifyContent: 'center',
														// 	color: '#000'
														// }}
														onClick={() => moveListElement(index, 'left')}
													>
														{'Up'}
													</button>
												)}
												{index < accessList.length - 1 && (
													<button
														disabled={!isEditing}
														type='button'
														className='btn btn-sm btn-outline-dark ms-2'
														// style={{
														// 	width: '20px', // Фиксированная ширина
														// 	height: '20px', // Фиксированная высота
														// 	fontSize: '1.2rem', // Уменьшенный размер текста
														// 	display: 'flex', // Центровка содержимого кнопки
														// 	alignItems: 'center',
														// 	justifyContent: 'center',
														// 	color: '#000'
														// }}
														onClick={() => moveListElement(index, 'right')}
													>
														{'Down'}
													</button>
												)}
												<button
													disabled={!isEditing}
													type='button'
													className='btn btn-sm btn-outline-danger ms-2'
													// style={{
													// 	width: '20px', // Фиксированная ширина
													// 	height: '20px', // Фиксированная высота
													// 	fontSize: '0.7rem', // Уменьшенный размер текста
													// 	fontWeight: 'bold', // Сделано жирным
													// 	textAlign:'center',
													// 	display: 'flex', // Центровка содержимого кнопки
													// 	alignItems: 'center',
													// 	justifyContent: 'center',
													// 	color: '#000'
													// }}
													onClick={() => deleteListElement(index)}
												>
													Delete
												</button>
											</div>
										</li>
									))}
								</ul>
							) : (
								// <ul
								// 	className='p-0 d-flex flex-wrap'
								// 	style={{ gap: '5px' }} // Уменьшаем расстояние между элементами
								// >
								// 	{accessList.map((rule, index) => (
								// 		<li
								// 			key={index}
								// 			className='d-flex align-items-center justify-content-between rounded px-2 py-1'
								// 			style={{
								// 				backgroundColor:
								// 					rule.control === 'allow' ? '#d4edda' : '#f8d7da', // Светло-зеленый и светло-красный
								// 				color: rule.control === 'allow' ? '#155724' : '#721c24', // Темно-зеленый и темно-красный
								// 				fontSize: '0.8rem', // Уменьшаем размер текста
								// 				lineHeight: '1' // Компактный текст
								// 			}}
								// 		>
								// 			{index > 0 && (
								// 				<button
								// 					disabled={!isEditing}
								// 					type='button'
								// 					className='btn btn-sm btn-outline-dark p-0 ms-1'
								// 					style={{
								// 						width: '20px', // Фиксированная ширина
								// 						height: '20px', // Фиксированная высота
								// 						fontSize: '0.7rem', // Уменьшенный размер текста
								// 						display: 'flex', // Центровка содержимого кнопки
								// 						alignItems: 'center',
								// 						justifyContent: 'center',
								// 						color: '#000'
								// 					}}
								// 					onClick={() => moveListElement(index, 'left')}
								// 				>
								// 					{'<'}
								// 				</button>
								// 			)}
								// 			{index < accessList.length - 1 && (
								// 				<button
								// 					disabled={!isEditing}
								// 					type='button'
								// 					className='btn btn-sm btn-outline-dark p-0 me-1'
								// 					style={{
								// 						width: '20px', // Фиксированная ширина
								// 						height: '20px', // Фиксированная высота
								// 						fontSize: '0.7rem', // Уменьшенный размер текста
								// 						display: 'flex', // Центровка содержимого кнопки
								// 						alignItems: 'center',
								// 						justifyContent: 'center',
								// 						color: '#000'
								// 					}}
								// 					onClick={() => moveListElement(index, 'right')}
								// 				>
								// 					{'>'}
								// 				</button>
								// 			)}
								// 			<span>
								// 				{/* {rule.control === 'allow' ? '+ ' : '- '} */}
								// 				{rule.ip}
								// 			</span>
								// 			<button
								// 				disabled={!isEditing}
								// 				type='button'
								// 				className='btn btn-sm btn-outline-dark p-0 ms-1'
								// 				style={{
								// 					width: '20px', // Фиксированная ширина
								// 					height: '20px', // Фиксированная высота
								// 					fontSize: '0.7rem', // Уменьшенный размер текста
								// 					display: 'flex', // Центровка содержимого кнопки
								// 					alignItems: 'center',
								// 					justifyContent: 'center',
								// 					color: '#000'
								// 				}}
								// 				onClick={() => deleteListElement(index)}
								// 			>
								// 				X
								// 			</button>
								// 		</li>
								// 	))}
								// </ul>
								<p className='m-0 mt-2'>No rules yet...</p>
							)}

							{isEditing && (
								<form
									className='row m-0 justify-content-between mt-2'
									onSubmit={handleAddRule}
								>
									<div className='col-6 p-0 pe-2'>
										<div
											className='d-flex align-items-center form-control'
											style={{
												backgroundColor:
													formData.control == 'allow' ? '#d4edda' : '#f8d7da', // Светло-зеленый и светло-красный
												color:
													formData.control === 'allow' ? '#155724' : '#721c24' // Темно-зеленый и темно-красный
											}}
										>
											<select
												style={{
													backgroundColor: 'inherit'
												}}
												className='form-control border-0 w-50 p-0 me-2 text-center'
												name='control'
												value={formData.control}
												onChange={handleInputChange}
											>
												<option value='allow'>allow :</option>
												<option value='forbid'>forbid :</option>
											</select>
											<input
												required
												style={{
													backgroundColor: 'inherit'
												}}
												className='form-control border-0 p-0 text-center'
												type='text'
												name='ip'
												placeholder='enter IP'
												value={formData.ip}
												onChange={handleInputChange}
											/>
										</div>
									</div>
									<div className='col-6 p-0 pe-2'>
										<button
											type='submit'
											className='btn btn-outline-primary w-100'
										>
											Add new rule
										</button>
									</div>
								</form>
							)}
							<div className='row m-0 justify-content-between mt-2'>
								<div className='col-6 p-0 pe-2'>
									{!isEditing && (
										<button
											type='button'
											onClick={handleEdit}
											className='btn btn-outline-dark w-100'
										>
											Edit list
										</button>
									)}
									{isEditing && (
										<button
											type='button'
											onClick={handleSave}
											className='btn btn-outline-success w-100'
										>
											Save Changes
										</button>
									)}
								</div>
								{isEditing && (
									<div className='col-6 p-0 pe-2'>
										<button
											disabled={!isEditing}
											type='button'
											onClick={handleCancel}
											className='btn btn-outline-danger w-100'
										>
											Cancel Changes
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AccessList
