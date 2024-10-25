import fetchData from '../utils/fetchData'
import { constants } from '../utils/constants'
const SwitchControl = ({ ioStatus, setIoStatus }) => {
	const Switch = ({ relayId, isActive }) => (
		<div className='form-check form-switch me-3'>
			<input
				className='form-check-input'
				type='checkbox'
				checked={isActive == 1}
				onChange={e => toggleRelay(relayId, e.target.checked ? 1 : 0)}
			/>
			<label className='form-check-label'>switch {relayId}</label>
		</div>
	)
	const toggleRelay = async (relayId, newState) => {
		try {
			const response = await fetch(`${constants.serverIp}/api/io/status`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ relay_id: relayId, state: newState })
			})

			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status} ${response.statusText}`)
			}

			await fetchData('/api/io/status', setIoStatus)
		} catch (error) {
			console.error('Ошибка при переключении реле:', error)
		}
	}
	return (
		<div className='col-md-2 col-sm-6'>
			<h2 className='mb-4 mt-4'>Реле</h2>
			{ioStatus.outputs.map((state, index) => (
				<div key={index} className='d-flex align-items-center mb-3'>
					<Switch relayId={index + 1} isActive={state} />
				</div>
			))}
		</div>
	)
}
export default SwitchControl
