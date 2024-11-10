import { useRef, useState } from 'react'

function FileUploader({
	url = 'http://10.0.20.230/api/firmware/upload',
	destinationFilePath = 'firmware.bin',
	maxSize = 200000,
	chunkSize = 1024
}) {
	const [file, setFile] = useState(null)
	const [fileSize, setFileSize] = useState(null)
	const [isUploading, setIsUploading] = useState(false)
	const isCancelledRef = useRef(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [uploadedBits, setUploadedBits] = useState(0)
	const fileInputRef = useRef(null)
	const [uploadError, setUploadError] = useState(null)

	const handleFileChange = e => {
		const file = e.target.files[0]
		setUploadProgress(0)
		setUploadedBits(0)
		setUploadError(null)
		if (file) {
			setFile(file)
			setFileSize(file.size)
			if (file.size > maxSize) {
				setUploadError('File size exceeds maximum allowed size')
			}
		}
	}

	const uploadFile = async () => {
		isCancelledRef.current = false
		setIsUploading(true)
		const reader = new FileReader()
		let offset = 0
		reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize))
		reader.onload = async () => {
			while (offset < fileSize && !isCancelledRef.current) {
				const chunk = file.slice(offset, offset + chunkSize)
				await uploadChunk(chunk, offset)
				offset += chunkSize
				await new Promise(resolve => setTimeout(resolve, 10))
			}
		}
		reader.onerror = () => {
			setUploadError('Error reading file')
			isCancelledRef.current = true
		}
	}

	const uploadChunk = async (chunk, offset) => {
		const params = new URLSearchParams({
			file: destinationFilePath,
			offset: offset.toString()
		})
		try {
			const response = await fetch(`${url}?${params}`, {
				method: 'POST',
				body: chunk,
				headers: { 'Content-Type': 'application/octet-stream' }
			})

			if (!response.ok) {
				throw new Error(
					`Failed to upload chunk at offset ${offset}. Server response: ${await response.text()}`
				)
			}
			setUploadedBits(prevBits => {
				const newBits = prevBits + chunk.size
				return newBits
			})
			setUploadProgress(
				Math.min(100, (((offset + chunkSize) / fileSize) * 100).toFixed(2))
			)
		} catch (error) {
			isCancelledRef.current = true
			setUploadError(error.message)
		}
	}

	const stopUpload = () => {
		isCancelledRef.current = true
		setIsUploading(false)
		setFile(null)
		fileInputRef.current.value = null
		setUploadError('file upload stopped by user')
	}

	return (
		<div className='col-md-4 d-flex flex-column mt-4'>
			<h2 className='mb-4'>File Uploader</h2>
			<div className='card flex-grow-1'>
				<div className='card-header'>
					<h5 className='card-title'>Upload Firmware</h5>
				</div>
				<div className='card-body'>
					<form className='d-flex flex-column gap-2'>
						<div className='mb-0'>
							<input
								ref={fileInputRef}
								disabled={isUploading}
								type='file'
								className='form-control'
								onChange={handleFileChange}
							/>
						</div>
						{uploadError && <p className='text-danger'>Error: {uploadError}</p>}
						{uploadProgress !== 0 && (
							<div className=''>
								<progress value={uploadProgress} max='100' className='w-100'>
									{uploadProgress}%
								</progress>
								<p className='text-center m-0'>
									{uploadedBits} bit /{fileSize} bit {uploadProgress}%
								</p>
							</div>
						)}
						{uploadProgress == 100 && (
							<div className=''>
								<p className='text-center m-0'>File uploaded successfully!</p>
							</div>
						)}
						{!isUploading && (
							<button
								disabled={!file || fileSize > maxSize}
								type='button'
								className='btn btn-outline-dark'
								onClick={uploadFile}
							>
								Upload File
							</button>
						)}
						{isUploading && (
							<button
								type='button'
								className='btn btn-outline-danger'
								onClick={stopUpload}
							>
								Cancel upload
							</button>
						)}
					</form>
				</div>
			</div>
		</div>
	)
}

export default FileUploader
