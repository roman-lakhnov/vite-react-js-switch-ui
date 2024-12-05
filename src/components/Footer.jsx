const Footer = () => {
	return (
		<div className='col-md-12 mt-4 d-flex flex-column pb-3'>
			<div className='row'>
				<div className='col-md-6 mt-2'>
					<div className='card'>
						<div className='card-body p-1 d-flex justify-content-evenly bg-light'>
							<p className='m-0 '>UI developed by Roman Lakhnov</p>
							<p className='m-0 ps-2'>
								<a
									className='text-black'
									href='https://github.com/roman-lakhnov/vite-react-js-switch-ui'
								>
									github.com
								</a>
							</p>
						</div>
					</div>
				</div>
				<div className='col-md-6 mt-2'>
					<div className='card'>
						<div className='card-body p-1 d-flex justify-content-evenly bg-light'>
							<p className='m-0 '>Backend developed by kshypachov</p>
							<p className='m-0 ps-2'>
								<a
									className='text-black'
									href='https://github.com/kshypachov/f411_io_mod'
								>
									github.com
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Footer
