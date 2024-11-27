import { constants } from './constants'
async function fetchData(endpoint, setState) {
	try {
		const response = await fetch(constants.serverIp + endpoint, {
			headers: {
				'Content-Type': 'application/json' 
			}
		})
		if (!response.ok) {
			throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`)
		}
		const data = await response.json()
		setState(data)
	} catch (error) {
		console.error('Ошибка запроса:', error)
	}
}
export default fetchData
