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
		enabled: false,
		protocol: 'mqtt',
		ip_domain: '',
		port: ''
	})
	useEffect(() => {
		const brokerRegex = /^(mqtt|mqtts):\/\/([\d.]+|\S+):(\d+)$/
		const match = mqttSettings.broker.match(brokerRegex)
		if (match) {
			const [, protocol, ip_domain, port] = match
			setFormData(prevData => ({
				...prevData,
				enabled: mqttSettings.enabled,
				broker: mqttSettings.broker,
				protocol,
				ip_domain,
				port
			}))
		}
	}, [mqttSettings])

	function handleInputChange(e) {
		const { name, value, type, checked } = e.target
		const newValue = type === 'checkbox' ? checked : value
		setFormData(prevData => {
			const updatedData = {
				...prevData,
				[name]: newValue
			}
			if (['protocol', 'ip_domain', 'port'].includes(name)) {
				updatedData.broker = `${updatedData.protocol}://${updatedData.ip_domain}:${updatedData.port}`
			}
			return updatedData
		})
		console.log(formData)
	}

	function filterEmptyFields(data) {
		return Object.fromEntries(
			Object.entries(data).filter(
				entry =>
					entry[1] !== '' &&
					entry[0] != 'protocol' &&
					entry[0] != 'ip_domain' &&
					entry[0] != 'port'
			)
		)
	}

	async function handleFormSubmit(e) {
		e.preventDefault()
		try {
			const ipRegex =
				/^(mqtt|mqtts):\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})$/
			const domainRegex =
				/^(mqtt|mqtts):\/\/(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z]{2,})+:(\d{1,5})$/
			if (ipRegex.test(formData.broker) || domainRegex.test(formData.broker)) {
				const filteredData = filterEmptyFields(formData)
				console.log(JSON.stringify(filteredData))
				const response = await fetch(
					constants.serverIp + '/api/mqtt/settings',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(filteredData)
					}
				)
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
			} else {
				toast.error(`Broker name is invalid. Can not save settings!`)
			}
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
			<h2 className='mb-4'>Device setup</h2>
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
								<div className='d-flex'>
									<div className='mb-3'>
										<label className='form-label'>
											<strong>Broker</strong>
										</label>
										<div className='d-flex align-items-center form-control'>
											<select
												className='form-control border-0 w-50'
												name='protocol'
												value={formData.protocol}
												onChange={handleInputChange}
											>
												<option value='mqtt'>mqtt ://</option>
												<option value='mqtts'>mqtts ://</option>
											</select>
											<input
												className='form-control border-0 '
												type='text'
												name='ip_domain'
												value={formData.ip_domain}
												placeholder={mqttSettings.ip_domain || ''}
												onChange={handleInputChange}
											/>
											<div>:</div>
											<input
												className='form-control border-0 w-50'
												type='number'
												max={65534}
												min={1}
												name='port'
												value={formData.port}
												placeholder={mqttSettings.port || ''}
												onChange={handleInputChange}
											/>
										</div>
									</div>
								</div>
								<div className='mb-3'>
									<label className='form-label'>
										<strong>Username</strong>
									</label>
									<input
										className='form-control'
										type='text'
										name='username'
										value={formData.username}
										placeholder={mqttSettings.username || ''}
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
										placeholder={mqttSettings.password || ''}
										onChange={handleInputChange}
									/>
								</div>
								<div className='form-check mb-3'>
									<input
										type='checkbox'
										className='form-check-input'
										name='enabled'
										checked={formData.enabled == true ? true : false}
										onChange={handleInputChange}
									/>
									<label className='form-check-label'>
										<strong>MQTT Enabled</strong>
									</label>
								</div>
								<div className='d-flex flex-column gap-3'>
									<button type='submit' className='btn btn-outline-dark'>
										<strong>Save settings</strong>
									</button>
									<button
										type='button'
										onClick={handleRestart}
										className='btn btn-outline-danger'
									>
										<strong>Restart device</strong>
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
