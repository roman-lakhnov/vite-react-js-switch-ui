import { useEffect, useState } from 'react'
import fetchData from '../utils/fetchData'
import { constants } from '../utils/constants'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const SettingsForm = ({ mqttSettings, setMqttSettings }) => {
	const [formData, setFormData] = useState({
		broker: '',
		username: '',
		password: '',
		enabled: false
	})
	useEffect(() => {
		setFormData(prevData => ({
			...prevData,
			enabled: mqttSettings.enabled
			// broker:mqttSettings.broker,
			// username:mqttSettings.username
		}))
	}, [mqttSettings])

	function handleInputChange(e) {
		const { name, value, type, checked } = e.target
		setFormData(prevData => ({
			...prevData,
			[name]: type === 'checkbox' ? checked : value
		}))
	}

	function filterEmptyFields(data) {
		return Object.fromEntries(
			Object.entries(data).filter(entry => entry[1] !== '')
		)
	}

	async function handleFormSubmit(e) {
		e.preventDefault()
		try {
			const filteredData = filterEmptyFields(formData)
			console.log(JSON.stringify(filteredData))

			const response = await fetch(constants.serverIp + '/api/mqtt/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(filteredData)
			})
			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status} ${response.statusText}`)
			}
			const result = await response.json()
			toast.success(
				`Настройки успешно сохранены и будут применены после следующей перезагрузки устройства. Device Message: ${JSON.stringify(
					result
				)}`
			)
			await fetchData('/api/mqtt/settings', setMqttSettings)
		} catch (error) {
			console.error('Ошибка при отправке настроек:', error)
		}
	}
	async function handleRestart() {
		try {
			const response = await fetch(constants.serverIp + '/api/device/restart', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			})
			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status} ${response.statusText}`)
			}
			const result = await response.json()
			toast.error(
				`Устройство будет перезагружено. Ожидайте. Device Message: ${JSON.stringify(
					result
				)}`
			)
		} catch (error) {
			console.error('Ошибка при перезагрузке:', error)
		}
	}

	return (
		<div className='col-md-4 d-flex flex-column mt-4'>
			<h2 className='mb-4'>Настройка устройства</h2>
			<div className='row flex-grow-1'>
				<div className='col-md-12 d-flex'>
					<div className='card flex-grow-1 '>
						<div className='card-header'>
							<h5 className='card-title'>MQTT Connection</h5>
						</div>
						<div className='card-body d-flex'>
							<form
								className='d-flex flex-column flex-grow-1 justify-content-between'
								onSubmit={handleFormSubmit}
							>
								{/* Поля формы */}
								{['broker', 'username', 'password'].map(field => (
									<div className='mb-3' key={field}>
										<label className='form-label'>
											<strong>{field}</strong>
										</label>
										<input
											required={field === 'broker' ? true : false}
											className='form-control'
											type={field === 'password' ? 'password' : 'text'}
											name={field}
											value={formData[field]}
											placeholder={mqttSettings[field] || ''}
											onChange={handleInputChange}
										/>
									</div>
								))}
								<div className='form-check mb-3'>
									<input
										type='checkbox'
										className='form-check-input'
										name='enabled'
										checked={formData.enabled==true?true:false}
										onChange={handleInputChange}
									/>
									<label className='form-check-label'>
										<strong>MQTT Enabled</strong>
									</label>
								</div>
								<div className='d-flex flex-column gap-3'>
									<button type='submit' className='btn btn-outline-dark'>
										<strong>Сохранить настройки</strong>
									</button>
									<button
										type='button'
										onClick={handleRestart}
										className='btn btn-outline-danger'
									>
										<strong>Перезагрузить устройство</strong>
									</button>
								</div>
							</form>
							<ToastContainer />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SettingsForm
