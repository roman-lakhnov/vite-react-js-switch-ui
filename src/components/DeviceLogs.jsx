import { useEffect, useRef, useState } from 'react'
import { constants } from '../utils/constants'
import { toast } from 'react-toastify'

const DeviceLogs = () => {
	const listRef = useRef(null)
	const [deviceLogs, setDeviceLogs] = useState(null)
	const [filteredLogs, setFilteredLogs] = useState(null)
	const [filterForm, setFilterForm] = useState({
		filter: ''
	})

	function handleInputChange(event) {
		const { name, value } = event.target
		setFilterForm(prevState => ({
			...prevState,
			[name]: value
		}))
	}

	useEffect(() => {
		if (deviceLogs) setFilteredLogs(filterLogs(deviceLogs))

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterForm, deviceLogs])

	function filterLogs(logs) {
		const filtered = logs.filter(log =>
			log.toLowerCase().includes(filterForm.filter.toLowerCase())
		)
		return filtered
	}

	useEffect(() => {
		// Прокрутить к концу при загрузке компонента или изменении списка
		if (listRef.current) {
			listRef.current.scrollTop = listRef.current.scrollHeight
		}
	}, [deviceLogs]) // Следим за изменениями в `deviceLogs`

	async function fetchData() {
		try {
			const response = await fetch(constants.serverIp + '/api/device/log', {
				headers: {
					'Content-Type': 'text/plain'
				}
			})
			if (!response.ok) {
				throw new Error(
					`Ошибка сети: ${response.status} ${response.statusText}`
				)
			}
			const textData = await response.text()
			const logEntries = textData.split(
				/(?=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g
			)
			setDeviceLogs(logEntries)
			setFilteredLogs(filterLogs(logEntries))
			toast.success('Logs refreshed')
		} catch (error) {
			// TODO  eng translation
			toast.error(`Ошибка запроса:${error}`)
		}
	}

	async function fetchOldData() {
		try {
			const response = await fetch(constants.serverIp + '/api/device/log_old', {
				headers: {
					'Content-Type': 'text/plain'
				}
			})
			if (!response.ok) {
				throw new Error(
					`Ошибка сети: ${response.status} ${response.statusText}`
				)
			}
			const textData = await response.text()
			const logEntries = textData.split(
				/(?=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g
			)
			setDeviceLogs(logEntries)
			toast.success('Logs refreshed')
		} catch (error) {
			// TODO  eng translation
			toast.error(`Ошибка запроса:${error}`)
		}
	}

	async function downloadLogs() {
		if (!filteredLogs) {
			toast.error('No logs to download')
			return
		}
		const logs = filteredLogs.join('\n')
		const blob = new Blob([logs], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'device_logs.txt'
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
		toast.success('Logs downloaded')
	}

	// TODO переделать весь рендеринг
	// TODO get archived logs button
	return (
		<div className='col-md-12 mt-4 d-flex flex-column'>
			<h2 className='mb-4'>Device Logs</h2>
			<div className='row h-100'>
				<div className='col-md-12 '>
					<div className='card h-100 '>
						<div className='card-header'>
							<h5 className='card-title'>Messages</h5>
						</div>
						<div className='card-body h-100'>
							<div className='row m-0 justify-content-between'>
								<div className='col-6 p-0 pe-1 pb-1'>
									<button
										type='button'
										onClick={fetchData}
										className='btn btn-outline-dark w-100'
									>
										Get actual logs
									</button>
								</div>
								<div className='col-6 p-0 ps-1 pb-1'>
									<button
										type='button'
										onClick={fetchOldData}
										className='btn btn-outline-dark w-100'
									>
										Get old logs
									</button>
								</div>
								<div className='col-6 p-0 pe-1 pt-1'>
									<input
										className='form-control'
										type='text'
										name='filter'
										value={filterForm.filter}
										placeholder='Filter logs'
										onChange={handleInputChange}
									/>
								</div>
								<div className='col-6 p-0 ps-1 pt-1'>
									<button
										type='button'
										onClick={downloadLogs}
										className='btn btn-outline-dark w-100'
									>
										Download logs {filteredLogs && filteredLogs.length}
									</button>
								</div>
							</div>
							{filteredLogs ? (
								<ul
									ref={listRef}
									className='mt-4'
									style={{
										maxHeight: '300px',
										minHeight: '70%',
										overflowY: 'auto',
										listStyle: 'none',
										padding: 0
									}}
								>
									{filteredLogs.map((entry, index) => {
										const parts = entry.split(
											new RegExp(`(${filterForm.filter})`, 'gi')
										)
										return (
											<li
												key={index}
												style={{
													backgroundColor: index % 2 === 0 ? '#f8f8f8' : '#fff',
													padding: '3px',
													paddingLeft: '15px'
												}}
											>
												{parts.map((part, i) =>
													part.toLowerCase() ===
													filterForm.filter.toLowerCase() ? (
														<strong key={i}>{part}</strong>
													) : (
														part
													)
												)}
											</li>
										)
									})}
								</ul>
							) : (
								<p className='m-0 mt-2'>No logs yet...</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default DeviceLogs
