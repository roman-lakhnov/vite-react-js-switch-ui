import { useRef, useState } from 'react'
import { constants } from '../utils/constants'
import CryptoJS from 'crypto-js'
import { toast } from 'react-toastify'

function FileUploader({
	url = `${constants.serverIp}/api/firmware/upload`,
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
	const [localMD5, setLocalMD5] = useState(null)
	const [serverMD5, setServerMD5] = useState(null)

	async function calculateLocalMD5(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onload = () => {
				const wordArray = CryptoJS.lib.WordArray.create(reader.result)
				const localMD5 = CryptoJS.MD5(wordArray).toString()
				resolve(localMD5)
			}
			reader.onerror = () => reject('Error calculating local MD5')
			reader.readAsArrayBuffer(file)
		})
	}

	async function getServerMD5() {
		try {
			const response = await fetch(`${constants.serverIp}/api/firmware/md5`)
			const data = await response.json()
			if (data.status === 'success') {
				return data.md5
			} else {
				throw new Error('Failed to fetch MD5 from server')
			}
		} catch (error) {
			setUploadError(error.message)
			return null
		}
	}

	const handleFileChange = async e => {
		const file = e.target.files[0]
		setUploadProgress(0)
		setUploadedBits(0)
		setUploadError(null)
		setLocalMD5(null)
		setServerMD5(null)
		if (file) {
			setFile(file)
			setFileSize(file.size)
			if (file.size > maxSize) {
				setUploadError('File size exceeds maximum allowed size')
			} else {
				const localMD5 = await calculateLocalMD5(file)
				setLocalMD5(localMD5)
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
				if (offset >= fileSize) {
					const serverMD5 = (await getServerMD5()).trim()
					setServerMD5(serverMD5)
					setIsUploading(false)
				}
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
		setUploadError('Uploading stopped by user.')
	}

	// TODO server endpoint rework needed in order to activate firmware and restart device
	async function handleRestart() {
		try {
			const response = await fetch(constants.serverIp + '/api/firmware/apply', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			})
			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status} ${response.statusText}`)
			}
			const result = await response.json()
			toast.error(
				`Устройство будет перезагружено. Ожидайте. Device Message: ${JSON.stringify(
					result
				)}`
			)
		} catch (error) {
			console.error('Ошибка при перезагрузке:', error)
		}
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
						{uploadError && <p className='text-danger'>Error: {uploadError}</p>}
						{uploadProgress == 100 && localMD5 && (
							<div className=''>
								<p style={{ fontSize: '0.6rem' }} className='text-center m-0'>
									{localMD5}-localMD5
								</p>
							</div>
						)}
						{uploadProgress == 100 && serverMD5 && (
							<div className=''>
								<p style={{ fontSize: '0.6rem' }} className='text-center m-0'>
									{serverMD5}-serverMD5
								</p>
							</div>
						)}
						{!isUploading && uploadProgress == 100 && localMD5 == serverMD5 && (
							<>
								<div className=''>
									<p className='text-center fw-bold m-0'>
										File uploaded successfully!
									</p>
								</div>
								<button
									type='button'
									className='btn btn-outline-warning'
									onClick={handleRestart}
								>
									<strong>Apply firmware and Restart device</strong>
								</button>
							</>
						)}
						{!isUploading && uploadProgress == 100 && localMD5 != serverMD5 && (
							<div className=''>
								<p className='text-center fw-bold text-danger m-0'>
									File damaged! Upload failed!
								</p>
							</div>
						)}
						{!isUploading &&
							localMD5 != serverMD5 &&
							file &&
							uploadProgress != 100 && (
								<button
									disabled={
										!file || fileSize > maxSize || uploadProgress == 100
									}
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
