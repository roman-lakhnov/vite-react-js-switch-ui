import { useEffect, useState } from 'react'
import DeviceData from './components/DeviceData'
import SettingsForm from './components/SettingsForm'
import Indicators from './components/Indicators'
import SwitchControl from './components/SwitchControl'
import fetchData from './utils/fetchData'

function App() {
	const [ramStatus, setRamStatus] = useState(null)
	const [deviceStatus, setDeviceStatus] = useState(null)
	const [ioStatus, setIoStatus] = useState({ inputs: [], outputs: [] })
	const [mqttSettings, setMqttSettings] = useState({
		broker: 'n/d',
		username: 'n/d',
		password: 'n/d',
		enabled: '0'
	})

	useEffect(() => {
		fetchData('/api/ram/status', setRamStatus)
		fetchData('/api/io/status', setIoStatus)
		fetchData('/api/mqtt/settings', setMqttSettings)
		fetchData('/api/device/status', setDeviceStatus)
	}, [])
	return (
		<div className='container mt-5'>
			<div className='row'>
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
				<SwitchControl ioStatus={ioStatus} setIoStatus={setIoStatus} />
				<Indicators gateStatus={ioStatus.inputs} title={'Входы'} />
				{/* <Indicators gateStatus={ioStatus.outputs} title={'Выходы'} /> */}
			</div>
		</div>
	)
}

export default App
