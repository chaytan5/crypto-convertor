import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import {
	convertCrypto,
	getCryptoList,
	getFiatList,
} from "@/services/cryptoService";

const formSchema = z.object({
	cryptocurrency: z.string({
		required_error: "Please select a source cryptocurrency",
	}),
	amount: z.coerce
		.number({ required_error: "Please enter the amount" })
		.min(0.001, { message: "Amount has to be larger than 0.01" }),
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
		(async () => {
			const data = await getFiatList();
			if (data !== undefined) {
				setFiatList(data);
			}
		})();

		(async () => {
			const data = await getCryptoList();
			setCryptoList(data);
		})();
	}, []);

	useEffect(() => {
		form.reset({ amount: 0 });
	}, [form.formState.isSubmitSuccessful, form.reset]);

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setFormState("loading");
		const { amount, cryptocurrency, currency } = values;

		const data = await convertCrypto(cryptocurrency, amount, currency);

		if (data) {
			setResult(data);
		}

		setFormState("idle");
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
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl defaultValue={field.value}>
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
									<Input type="text" placeholder="0.001" {...field} />
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
								<Select onValueChange={field.onChange} defaultValue="USD">
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
