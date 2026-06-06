export default function errorHandler(err, req, res, next) {
	const isCorsError = typeof err?.message === 'string' && err.message.startsWith('Not allowed by CORS');
	const status = err.statusCode || err.status || (isCorsError ? 403 : 500);
	const message = err.message || 'Internal server error';

	if (status >= 500) {
		console.error('Unhandled error:', err);
	}

	res.status(status).json({ message });
}
