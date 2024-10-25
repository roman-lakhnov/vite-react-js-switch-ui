const Indicators = ({ gateStatus, title }) => {
	const Indicator = ({ state, label }) => (
		<div className='d-flex align-items-center me-3'>
			<div
				style={{
					marginRight:10,
					width: 20,
					height: 20,
					borderRadius: '50%',
					backgroundColor: state ? 'green' : 'red'
				}}
				></div>
				<span>{label}</span>
		</div>
	)
	return (
		<div className="col-md-2 col-sm-6">
			<h2 className='mb-4 mt-4'>{title}</h2>
			{gateStatus.map((state, index) => (
				<div key={index} className='d-flex align-items-center mb-3'>
					<Indicator state={state} label={`gate ${index + 1}`} />
				</div>
			))}
		</div>
	)
}
export default Indicators
