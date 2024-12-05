const DeviceData = ({
	ramStatus,
	deviceStatus
	// ioStatus, mqttSettings
}) => {
	const Card = ({ title, data }) => {
		return (
			<div className='col-md-6 mt-3'>
				<div className='card h-100 '>
					<div className='card-header'>
						<h5 className='card-title'>{title}</h5>
					</div>
					<div className='card-body'>
						<ul className='list-group h-100'>
							{Object.entries(data).map(([key, value]) => (
								<li key={key} className='list-group-item h-100'>
									<strong>{key}:</strong>{' '}
									{Array.isArray(value) ? value.join(', ') : value}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		)
	}
	return (
		<div className='col-md-8 mt-4 d-flex flex-column'>
			<h2>Device data</h2>
			<div className='row h-100'>
				{ramStatus && <Card title='RAM Status' data={ramStatus} />}
				{deviceStatus && <Card title='Device Status' data={deviceStatus} />}
				{/* {ioStatus && <Card title='IO Status' data={ioStatus} />}
		{mqttSettings && (
			<Card title='Current MQTT Settings' data={mqttSettings} />
			)} */}
			</div>
		</div>
	)
}

export default DeviceData
