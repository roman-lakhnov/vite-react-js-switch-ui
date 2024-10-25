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
			<label className='form-check-label'><strong>switch {relayId}</strong></label>
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
		<div className='mt-4 col-md-6 col-sm-12'>
			<div className='d-flex justify-content-between border rounded bg-light'>
				<h2 className='m-2 align-content-center'>Реле</h2>
				{ioStatus.outputs.map((state, index) => (
					<div key={index} className='align-content-center'>
						<Switch relayId={index + 1} isActive={state} />
					</div>
				))}
			</div>
		</div>
	)
}
export default SwitchControl
