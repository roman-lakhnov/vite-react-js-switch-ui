const DeviceData = ({
	ramStatus,
	deviceStatus,
	// ioStatus, mqttSettings
}) => {
	const Card = ({ title, data }) => {
		return (
			<div className='col-md-6 mb-4'>
				<div className='card'>
					<div className='card-header'>
						<h5 className='card-title'>{title}</h5>
					</div>
					<div className='card-body'>
						<ul className='list-group'>
							{Object.entries(data).map(([key, value]) => (
								<li key={key} className='list-group-item'>
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
		<div className="col-md-8">
			<h2 className='mb-4'>Данные устройства</h2>
			<div className='row'>
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
