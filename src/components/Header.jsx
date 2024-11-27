import { toast } from "react-toastify"
import { constants } from "../utils/constants"

const Header = ({ setAuthUser, authUser }) => {
	function handleLogOut() {
		//TODO сделать лого и кнопку по бокам
		setAuthUser(false)
		async function cancelAccessToken() {
			try {
				const response = await fetch(`${constants.serverIp}/api/logout`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					}
				})
				if (!response.ok) {
					throw new Error(
						`Logout failed: ${response.status} ${response.statusText}`
					)
				}
				const result = await response.json() 
				console.log(result.message);
				
			} catch (error) {
				toast.warning('Error during token check:', error)
			}
		}
		cancelAccessToken()
	}

	return (
		
		<div className='d-flex justify-content-center gap-3 align-content-center align-items-center'>
			<h1 className='m-0 d-flex align-items-center border rounded border-1 bg-light ps-3 pe-3 h-100'>
				SwitchUI
			</h1>
			{authUser && (
				<div className='align-items-center d-flex gap-2 border rounded border-1 bg-light ps-3 pe-3 h-100'>
					<p className='m-0 '>
						You have logged in as <strong>{authUser}</strong>
					</p>
					<button
						className='btn btn-sm btn-outline-dark'
						type='button'
						onClick={handleLogOut}
					>
						<strong>Log out</strong>
					</button>
				</div>
			)}
		</div>
	)
}

export default Header
