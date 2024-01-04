import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function getFiatList() {
	try {
		const res = await axios.get(`${API_URL}/api/fiat/list`);
		const data = res.data;
		return data.data.data;
	} catch (error) {
		if (error instanceof Error) {
			console.log(error.message);
		} else {
			console.log(error);
		}
		return undefined;
	}
}

export async function getCryptoList() {
	try {
		const res = await axios.get(`${API_URL}/api/crypto/list`);
		const data = res.data;
		return data.data;
	} catch (error) {
		if (error instanceof Error) {
			console.log(error.message);
		} else {
			console.log(error);
		}
		return undefined;
	}
}

export async function convertCrypto(
	cryptocurrency: string,
	amount: number,
	currency: string
) {
	try {
		const res = await axios.get(`${API_URL}/api/convert`, {
			params: {
				crypto: cryptocurrency,
				fiat: currency,
				amount: amount,
			},
		});

		const { data } = res;

		if (!data.error) {
			const { convertedAmount, fiat } = data;

			return { convertedAmount, fiat };
		} else {
			return null;
		}
	} catch (error) {
		console.log(error);
	}
}
