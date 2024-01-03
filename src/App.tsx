import { ConvertorForm } from "./components/ConvertorForm";
import Header from "./components/Header";

function App() {
	return (
		<>
			<Header />
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
