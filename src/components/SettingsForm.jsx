import { useEffect, useState } from 'react'
import fetchData from '../utils/fetchData'
import { constants } from '../utils/constants'

const SettingsForm = ({ mqttSettings, setMqttSettings }) => {
	const [formData, setFormData] = useState({
		broker: '',
		username: '',
		password: '',
		enabled: '0'
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
			// TODO переделать в окно
			// TODO добавить кнопку перезагрузки
			alert(
				`Настройки успешно сохранены и будет пременены после следующей перезагрузки устройства. Device Message: ${JSON.stringify(
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
			alert(
				`Устройство успешно перезагружено. Device Message: ${JSON.stringify(
					result
				)}`
			)
		} catch (error) {
			console.error('Ошибка при перезагрузке:', error)
		}
	}
	return (
		<div className='col-md-4 mb-4'>
			<h2 className='mb-4'>Настройка устройства</h2>
			<form onSubmit={handleFormSubmit}>
				{/* Поля формы */}
				{['broker', 'username', 'password'].map(field => (
					<div className='mb-3' key={field}>
						<label className='form-label'>{field}</label>
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
						checked={formData.enabled == 1 ? 1 : 0}
						onChange={handleInputChange}
					/>
					<label className='form-check-label'>MQTT Enabled</label>
				</div>
				<div className='d-flex justify-content-between'>
					<button type='submit' className='btn btn-outline-dark'>
						Сохранить настройки
					</button>
					<button
						type='button'
						onClick={handleRestart}
						className='btn btn-outline-danger'
					>
						Перезагрузить устройство
					</button>
				</div>
			</form>
		</div>
	)
}

export default SettingsForm
