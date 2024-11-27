import { useState } from 'react'
import { constants } from '../utils/constants'
import { toast, ToastContainer } from 'react-toastify'

const DeviceLogs = () => {
	const [deviceLogs, setDeviceLogs] = useState(null)
	let endpoint = '/api/device/log'

	async function fetchData() {
		try {
			const response = await fetch(constants.serverIp + endpoint, {
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
			setDeviceLogs(logEntries.reverse())
			toast.success('Logs refreshed')
		} catch (error) {
			
			// TODO  eng translation
			console.error('Ошибка запроса:', error)
		}
	}
	async function downloadLogs() {
		toast.warn('this feature is under development')
		//TODO
	}

	// TODO переделать весь рендеринг
	return (
		<div className='col-md-8 mt-4 d-flex flex-column'>
			<ToastContainer />
			<h2 className='mb-4'>Device Logs</h2>
			<div className='row h-100'>
				<div className='col-md-12 '>
					<div className='card h-100 '>
						<div className='card-header'>
							<h5 className='card-title'>Messages</h5>
						</div>
						<div className='card-body h-100'>
							<div className='row m-0 justify-content-between'>
								<div className='col-6 p-0 pe-2'>
									<button
										type='button'
										onClick={fetchData}
										className='btn btn-outline-dark w-100'
									>
										Get actual logs
									</button>
								</div>
								<div className='col-6 p-0 ps-2'>
									<button
										type='button'
										onClick={downloadLogs}
										className='btn btn-outline-dark w-100'
									>
										Download logs file
									</button>
								</div>
							</div>
							{deviceLogs ? (
								<ul
									className='mt-4'
									style={{
										maxHeight: '100px',
										minHeight: '70%',
										overflowY: 'auto',
										listStyle: 'none',
										padding: 0
									}}
								>
									{deviceLogs.map((entry, index) => (
										<li
											key={index}
											style={{
												backgroundColor: index % 2 === 0 ? '#f8f8f8' : '#fff',
												padding: '3px',
												paddingLeft: '15px'
											}}
										>
											{entry}
										</li>
									))}
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
