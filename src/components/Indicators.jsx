const Indicators = ({ gateStatus, title }) => {
	const Indicator = ({ state, label }) => (
		<div className='d-flex align-items-center me-3'>
			<div
				style={{
					marginRight: 10,
					width: 20,
					height: 20,
					borderRadius: '50%',
					backgroundColor: state ? 'green' : 'red'
				}}
			></div>
			<span><strong>{label}</strong></span>
		</div>
	)
	return (
		<div className='mt-4 col-md-6 col-sm-12  '>
			<div className="d-flex justify-content-between border rounded bg-light ">
				<h2 className='m-2 align-content-center'>{title}</h2>
				{gateStatus.map((state, index) => (
					<div key={index} className='align-content-center'>
						<Indicator state={state} label={`input ${index + 1}`} />
					</div>
				))}
			</div>
		</div>
	)
}
export default Indicators
