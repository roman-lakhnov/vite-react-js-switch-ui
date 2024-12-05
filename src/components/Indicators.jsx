const Indicators = ({ gateStatus, title }) => {
	const Indicator = ({ state, label }) => (
		<div className='d-flex align-items-center me-3'>
			<div
				style={{
					marginRight: 10,
					width: 13,
					height: 13,
					borderRadius: '50%',
					backgroundColor: state ? '#32CD32' : 'red', 
				}}
			></div>
			<span>
				<strong>{label}</strong>
			</span>
		</div>
	)
	return (
		<div className='mt-4 col-md-6 col-sm-12  '>
			<div className='d-flex justify-content-between border rounded bg-light px-2'>
				<h2 className='m-0 pb-1 align-content-center'>{title}</h2>
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
