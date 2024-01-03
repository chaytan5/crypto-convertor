import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

import { useEffect, useState } from "react";

const formSchema = z.object({
	cryptocurrency: z.string({
		required_error: "Please select a source cryptocurrency",
	}),
	amount: z.coerce
		.number()
		.multipleOf(0.01)
		.min(0.01, { message: "Must be greater than 0.01" }),
	currency: z.string({
		required_error: "Please select a currency",
	}),
});

type FiatList = { id: number; name: string; sign: string; symbol: string }[];

type CryptoList = {
	id: number;
	rank: number;
	name: string;
	symbol: string;
	slug: string;
	is_active: number;
	first_historical_data: Date;
	last_historical_data: Date;
	platform: unknown;
}[];

type Result = {
	convertedAmount: number;
	fiat: string;
};

export function ConvertorForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			currency: "USD",
		},
	});

	const [cryptoList, setCryptoList] = useState<CryptoList>([]);
	const [fiatList, setFiatList] = useState<FiatList>([]);
	const [formState, setFormState] = useState<"idle" | "loading" | "error">(
		"idle"
	);
	const [result, setResult] = useState<Result | null>(null);

	useEffect(() => {
		async function getFiatList() {
			const res = await axios.get("http://localhost:7000/api/fiat/list");
			const data = res.data;
			setFiatList(data.data.data);
		}

		async function getCryptoList() {
			const res = await axios.get("http://localhost:7000/api/crypto/list");
			const data = res.data;
			setCryptoList(data.data);
		}

		getFiatList();
		getCryptoList();
	}, []);

	useEffect(() => {
		form.reset({
			amount: 0,
		});
	}, [form.formState.isSubmitSuccessful]);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setFormState("loading");
			const { amount, cryptocurrency, currency } = values;

			const res = await axios.post("http://localhost:7000/api/convert", {
				crypto: cryptocurrency,
				fiat: currency,
				amount: amount,
			});

			const { data } = res;

			const { convertedAmount, fiat } = data;

			setResult({ convertedAmount, fiat });
		} catch (error) {
			setFormState("error");
			console.log(error);
		} finally {
			setFormState("idle");
		}
	}

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="cryptocurrency"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Cryptocurrency</FormLabel>
								<Select onValueChange={field.onChange}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a currency" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{cryptoList?.map((crypto, i) => (
											<SelectItem key={i} value={crypto.symbol}>
												{crypto.symbol} ({crypto.name})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>
									Select the crypto you want to convert
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="amount"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Amount</FormLabel>
								<FormControl>
									<Input type="number" placeholder="10.00" {...field} />
								</FormControl>
								<FormDescription>
									Enter the amount you wish to convert
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="currency"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Currency</FormLabel>
								<Select onValueChange={field.onChange}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a currency" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{fiatList?.map((item, i) => (
											<SelectItem key={i} value={item.symbol}>
												{item.symbol} ({item.name})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>
									Select the fiat currency you want to convert to
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="text-center">
						<Button
							disabled={formState === "loading" ? true : false}
							type="submit"
						>
							{formState === "loading" ? "Loading" : "Submit"}
						</Button>
					</div>
				</form>
			</Form>

			{result && (
				<div className="pt-4">
					Your converted amount is{" "}
					<b>{result.convertedAmount.toLocaleString("en")}</b> {result.fiat}
				</div>
			)}
		</>
	);
}