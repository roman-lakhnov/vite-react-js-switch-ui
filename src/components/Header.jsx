const Header = () => {
	return (
		<div className='d-flex justify-content-between gap-3 align-content-center align-items-center'>
			<h1 className='m-0 d-flex align-items-center border rounded border-1 bg-light ps-3 pe-3 h-100'>
				SwitchUI
			</h1>
			<div className='align-items-center d-flex gap-2 border rounded border-1 bg-light ps-3 pe-3 h-100'>
				<p className='m-0 '>Developed by Roman Lakhnov</p>
				<p className='m-0 '>
					Contacts-
					<a
						className='text-black'
						href='https://github.com/roman-lakhnov/vite-react-js-switch-ui'
					>
						github.com
					</a>
				</p>
			</div>
		</div>
	)
}

export default Header
