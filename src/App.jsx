import { useEffect, useState } from 'react'
import DeviceData from './components/DeviceData'
import SettingsForm from './components/SettingsForm'
import Indicators from './components/Indicators'
import SwitchControl from './components/SwitchControl'
import fetchData from './utils/fetchData'
import Header from './components/Header'
import FileUploader from './components/FileUploader'
import DeviceLogs from './components/DeviceLogs'
import AuthForm from './components/AuthForm'
import Footer from './components/Footer'
import { constants } from './utils/constants'
import UserData from './components/UserData'
import { ToastContainer } from 'react-toastify'

function App() {
	const [usersData, setUsersData] = useState(null)
	const [ramStatus, setRamStatus] = useState(null)
	const [deviceStatus, setDeviceStatus] = useState(null)
	const [ioStatus, setIoStatus] = useState({ inputs: [], outputs: [] })
	const [mqttSettings, setMqttSettings] = useState({
		broker: 'n/d',
		username: 'n/d',
		password: 'n/d',
		enabled: false
	})
	const [authUser, setAuthUser] = useState(null)
	const [refresh, setRefresh] = useState(0)

	useEffect(() => {
		async function accessTokenCheck() {
			try {
				const response = await fetch(`${constants.serverIp}/api/login`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				})
				if (response.status == 403) {
					setAuthUser(null)
				} else {
					const result = await response.json()
					setAuthUser(result.user)
				}
			} catch (error) {
				console.error('Error during token check:', error)
			}
		}
		accessTokenCheck()
	}, [])

	useEffect(() => {
		//TODO пофиксить многократные вызовы
		if (authUser) {
			fetchData('/api/ram/status', setRamStatus)
			fetchData('/api/io/status', setIoStatus)
			fetchData('/api/mqtt/settings', setMqttSettings)
			fetchData('/api/device/status', setDeviceStatus)
			fetchData('/api/device/user', setUsersData)
		}
	}, [authUser, refresh])
	// TODO запрашивать логи. виводить логи. давать скачать логи.
	return (
		<>
			<div className='container d-flex flex-column vh-100 pt-3'>
				<Header setAuthUser={setAuthUser} authUser={authUser} />
				{!authUser && (
					<div className='d-flex justify-content-center align-items-center flex-grow-1'>
						<AuthForm authUser={authUser} setAuthUser={setAuthUser} />
					</div>
				)}
				{authUser && (
					<div className='row'>
						<SwitchControl ioStatus={ioStatus} setIoStatus={setIoStatus} />
						<Indicators gateStatus={ioStatus.inputs} title={'Inputs'} />
						<SettingsForm
							mqttSettings={mqttSettings}
							setMqttSettings={setMqttSettings}
						/>
						<DeviceData
							ramStatus={ramStatus}
							deviceStatus={deviceStatus}
							ioStatus={ioStatus}
							mqttSettings={mqttSettings}
						/>
						<FileUploader />
						<UserData usersData={usersData} setRefresh={setRefresh} />
						<DeviceLogs />
					</div>
				)}
				<Footer />
			</div>
			<ToastContainer />
		</>
	)
}

export default App
