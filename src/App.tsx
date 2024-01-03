import { ConvertorForm } from "./components/ConvertorForm";

function App() {
	return (
		<>
			<div className="bg-slate-800 py-4">
				<h1 className="text-2xl text-center text-slate-100 font-semibold">
					Crypto Convertor
				</h1>
			</div>
			<main className="bg-slate-200 h-dvh">
				<div className="w-11/12 max-w-screen-lg mx-auto h-full ">
					<div className="w-full max-w-xs mx-auto h-full pt-20">
						<ConvertorForm />
					</div>
				</div>
			</main>
		</>
	);
}

export default App;
